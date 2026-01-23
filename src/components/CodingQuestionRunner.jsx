import React, { useState, useEffect } from 'react';
import { runCode, submitCode } from '../api/submissions.api';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for highlighting

export default function CodingQuestionRunner({ question, value, onChange }) {
    const [results, setResults] = useState(null);
    const [running, setRunning] = useState(false);
    // Parse value: it could be string (legacy) or object {code, language}
    const initialCode = (typeof value === 'object' && value?.code) ? value.code : (typeof value === 'string' ? value : (question.codeTemplate || ''));
    const initialLang = (typeof value === 'object' && value?.language) ? value.language : (question.language || 'javascript');

    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLang);
    const [executed, setExecuted] = useState(value?.executed || false); // Track if current code has been run
    const [activeTab, setActiveTab] = useState('testcases');

    useEffect(() => {
        // Sync internal state if prop changes remotely (unlikely but safe)
        // But be careful not to loop. onChange updates parent, parent passes back value.
    }, [value]);

    function handleCodeChange(val) {
        setCode(val);
        setExecuted(false); // Reset execution status on edit
        // Bubble up as object
        onChange({ code: val, language, executed: false });
    }

    function handleLanguageChange(lang) {
        setLanguage(lang);
        setResults(null); // Clear previous results
        setExecuted(false); // Reset on language change too

        // Auto-fill template based on language
        let newCode = '';
        if (lang === 'java') {
            newCode = `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n        // Use System.out.println() for output\n    }\n}`;
        } else if (lang === 'python') {
            newCode = `import sys\n\n# Read input from stdin\ninput_data = sys.stdin.read().split()\n\n# Your code here\n# print(result)`;
        } else if (lang === 'javascript') {
            newCode = `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\n// Your code here\n// console.log(result);`;
        }
        setCode(newCode);

        onChange({ code: newCode, language: lang, executed: false });
    }

    const [customInput, setCustomInput] = useState('');
    const [useCustomInput, setUseCustomInput] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState(null);

    async function handleRun() {
        console.log('handleRun started');
        setRunning(true);
        if (useCustomInput) {
            setConsoleOutput(null);
            setActiveTab('console');
        } else {
            setResults(null);
            setActiveTab('testcases');
        }

        try {
            if (useCustomInput) {
                // Run against custom input (Compiler Mode)
                console.log('Sending request to /run (Custom Input)');
                const res = await runCode({
                    code,
                    language,
                    input: customInput
                });
                console.log('Run response:', res);

                if (res.success) {
                    setConsoleOutput({
                        output: res.data.output,
                        error: res.data.error,
                        success: res.data.success
                    });
                } else {
                    setConsoleOutput({
                        error: res.message || 'Execution Failed',
                        success: false
                    });
                }
            } else {
                // Run against defined test cases (Judge Mode)
                console.log('Sending request to /submit');
                const res = await submitCode({
                    questionId: question.id,
                    code,
                    language
                });
                console.log('Response received:', res);

                if (res.success) {
                    if (res.data.error) {
                        setResults([{ error: res.data.error }]);
                    } else if (res.data.results && res.data.results.length > 0) {
                        setResults(res.data.results);
                    } else {
                        setResults([{ error: 'No test cases found. Please contact instructor.' }]);
                    }
                    setActiveTab('testcases');
                    setExecuted(true); // Mark as executed only if run against test cases
                    onChange({ code, language, executed: true }); // Update parent
                } else {
                    console.error('Run failed:', res);
                    setResults([{ error: 'Execution failed: ' + (res.message || 'Unknown error') }]);
                }
            }
        } catch (err) {
            console.error('Run error:', err);
            let errorMsg = 'Error running code';
            if (err.response && err.response.status === 401) {
                errorMsg = 'Session Expired. Please log out and log in again.';
            } else if (err.message) {
                errorMsg = err.message;
            }

            if (useCustomInput) {
                setConsoleOutput({ error: errorMsg, success: false });
            } else {
                setResults([{ error: errorMsg }]);
            }
        } finally {
            setRunning(false);
        }
    }

    // Resizable Panels State
    const [leftWidth, setLeftWidth] = useState(40); // Percentage
    const [resultsHeight, setResultsHeight] = useState(300); // Pixels for results panel
    const containerRef = React.useRef(null);
    const draggingVertical = React.useRef(false);
    const draggingHorizontal = React.useRef(false);

    // Vertical Split (Left/Right)
    const startVerticalDrag = (e) => {
        e.preventDefault();
        draggingVertical.current = true;
        document.addEventListener('mousemove', onVerticalDrag);
        document.addEventListener('mouseup', stopDrag);
        // Add overlay to prevent iframe stealing events
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const onVerticalDrag = (e) => {
        if (!draggingVertical.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        // Constraints
        if (newWidth < 20) newWidth = 20;
        if (newWidth > 80) newWidth = 80;
        setLeftWidth(newWidth);
    };

    // Horizontal Split (Editor/Results)
    const startHorizontalDrag = (e) => {
        e.preventDefault();
        draggingHorizontal.current = true;
        document.addEventListener('mousemove', onHorizontalDrag);
        document.addEventListener('mouseup', stopDrag);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    const onHorizontalDrag = (e) => {
        if (!draggingHorizontal.current) return;
        // Calculate height from bottom
        // We know the container of right panel takes full height.
        // But safer to just track mouse Y relative to the resize handle?
        // Actually, easier to track relative movement or just absolute Y from bottom.
        // Let's rely on standard logic: Results is at bottom. Height = ContainerBottom - MouseY.

        // Better: ResultsHeight = currentHeight - dy.
        // But we don't have dy easily.
        // Let's use: Height = WindowHeight - MouseY (approx) or relative to parent?
        // Since the resize handle is AT the top of the results panel:
        // MouseY IS the top of the results panel.
        // Height = BottomOfRightPanel - MouseY.

        // We need the rect of the right panel container
        const rightPanel = document.getElementById('right-panel-container');
        if (rightPanel) {
            const rect = rightPanel.getBoundingClientRect();
            const newHeight = rect.bottom - e.clientY;
            if (newHeight < 100) return; // Min height
            if (newHeight > rect.height - 100) return; // Max height
            setResultsHeight(newHeight);
        }
    };

    const stopDrag = () => {
        draggingVertical.current = false;
        draggingHorizontal.current = false;
        document.removeEventListener('mousemove', onVerticalDrag);
        document.removeEventListener('mousemove', onHorizontalDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };

    return (
        <div
            ref={containerRef}
            className="flex h-[calc(100vh-180px)] border bg-white rounded-lg overflow-hidden font-sans relative"
        >
            {/* Left Panel: Problem Statement */}
            <div
                style={{ width: `${leftWidth}%` }}
                className="flex flex-col h-full bg-white overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent shrink-0"
            >
                <h3 className="font-bold text-2xl mb-4 text-gray-900">{question.text}</h3>
                <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                    <p className="whitespace-pre-wrap leading-relaxed">{question.description}</p>
                </div>

                {question.constraints && (
                    <div className="mb-6">
                        <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-2">Constraints</h4>
                        <div className="bg-gray-50 border-l-4 border-gray-300 p-3 text-sm font-mono text-gray-700 whitespace-pre-wrap">
                            {question.constraints}
                        </div>
                    </div>
                )}

                {question.TestCases && question.TestCases.some(tc => tc.isPublic) && (
                    <div className="mb-6">
                        {question.TestCases.filter(tc => tc.isPublic).map((tc, idx) => (
                            <div key={idx} className="mb-6">
                                <div className="mb-3">
                                    <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-1">Sample Input {idx}</h4>
                                    <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                        {tc.input}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-1">Sample Output {idx}</h4>
                                    <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                        {tc.expectedOutput}
                                    </div>
                                </div>
                                {tc.explanation && (
                                    <div className="mb-3">
                                        <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-1">Explanation</h4>
                                        <div className="text-gray-700 text-sm leading-relaxed">
                                            {tc.explanation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Vertical Resizer Handle */}
            <div
                className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex items-center justify-center shrink-0 transition-colors z-20"
                onMouseDown={startVerticalDrag}
            >
                <div className="h-8 w-1 bg-gray-400 rounded-full" />
            </div>

            {/* Right Panel: Code Editor */}
            <div
                id="right-panel-container"
                className="flex flex-col h-full bg-gray-900 grow min-w-0"
                style={{ width: `calc(${100 - leftWidth}% - 8px)` }}
            >
                <div className="bg-gray-800 text-gray-300 text-xs font-semibold px-4 py-2 flex justify-between items-center border-b border-gray-700 h-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <span>Language:</span>
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-transparent border-none text-white focus:ring-0 cursor-pointer p-0 font-bold hover:text-green-400"
                        >
                            <option value="javascript" className="bg-gray-800 text-white">JavaScript (Node.js)</option>
                            <option value="python" className="bg-gray-800 text-white">Python 3</option>
                            <option value="java" className="bg-gray-800 text-white">Java 17</option>
                        </select>
                    </div>
                    {/* Run Button removed from header */}
                </div>

                {/* Editor Area - Takes available space */}
                <div className="flex-1 w-full bg-gray-900 overflow-auto min-h-0 relative custom-scrollbar">
                    <Editor
                        value={code}
                        onValueChange={handleCodeChange}
                        highlight={code => {
                            let grammer = languages.javascript;
                            if (language === 'python') grammer = languages.python;
                            if (language === 'java') grammer = languages.java;
                            return highlight(code, grammer || languages.javascript);
                        }}
                        padding={16}
                        className="font-mono text-sm"
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 14,
                            backgroundColor: '#111827', // Tailwind gray-900
                            minHeight: '100%',
                            color: '#f8f8f2', // Ensure text is visible
                        }}
                        textareaClassName="focus:outline-none"
                    />
                </div>

                {/* Custom Input Area (Conditional) */}
                {useCustomInput && (
                    <div className="bg-gray-800 border-t border-gray-700 p-2 shrink-0 h-32 flex flex-col">
                        <span className="text-gray-400 text-xs font-bold mb-1">Custom Input</span>
                        <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter input here..."
                            className="flex-1 w-full bg-gray-900 text-white text-xs font-mono p-2 resize-none focus:outline-none border border-gray-600 rounded"
                        />
                    </div>
                )}

                {/* Horizontal Resizer Handle */}
                <div
                    className="h-2 bg-gray-800 hover:bg-blue-400 cursor-row-resize flex justify-center items-center shrink-0 transition-colors border-t border-b border-gray-700 z-10"
                    onMouseDown={startHorizontalDrag}
                >
                    <div className="w-8 h-1 bg-gray-500 rounded-full" />
                </div>

                {/* Results Panel - Powered by state height */}
                <div
                    className="bg-black text-white flex flex-col shrink-0 z-10"
                    style={{ height: resultsHeight }}
                >
                    <div className="flex justify-between items-center bg-gray-800 border-b border-gray-700 px-2 py-1 h-8 shrink-0">
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-1 text-xs font-medium rounded-t ${activeTab === 'testcases' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setActiveTab('testcases')}
                            >
                                Test Results {results && `(${results.length})`}
                            </button>
                            <button
                                className={`px-4 py-1 text-xs font-medium rounded-t ${activeTab === 'console' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setActiveTab('console')}
                            >
                                Output / Console
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useCustomInput}
                                    onChange={(e) => setUseCustomInput(e.target.checked)}
                                    className="w-3 h-3 text-blue-600 rounded focus:ring-0"
                                />
                                <span className="text-gray-400 text-xs hover:text-white">Custom Input</span>
                            </label>
                            {results && results.some(r => r.error) && <span className="text-red-400 text-xs px-2">⚠ Errors Detected</span>}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                        {running ? (
                            <div className="text-blue-400 animate-pulse">Running...</div>
                        ) : activeTab === 'console' ? (
                            // Console Tab Content
                            <div className="space-y-2">
                                {consoleOutput ? (
                                    <div>
                                        {consoleOutput.error && (
                                            <div className="bg-red-900/30 p-2 rounded border border-red-900/50 mb-2">
                                                <span className="text-red-400 block mb-1 uppercase text-[10px]">Error</span>
                                                <span className="whitespace-pre-wrap text-red-200">{consoleOutput.error}</span>
                                            </div>
                                        )}
                                        {consoleOutput.output && (
                                            <div className="bg-black/30 p-2 rounded border border-gray-700">
                                                <span className="text-gray-500 block mb-1 uppercase text-[10px]">Output</span>
                                                <span className="whitespace-pre-wrap text-white">{consoleOutput.output}</span>
                                            </div>
                                        )}
                                        {!consoleOutput.error && !consoleOutput.output && (
                                            <div className="text-gray-500 italic">Program finished with no output.</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">Run code to see output...</div>
                                )}
                            </div>
                        ) : results ? (
                            <div className="space-y-2">
                                {results.map((res, idx) => (
                                    <div key={idx} className={`p-3 rounded border ${res.passed ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`font-bold ${res.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                Test Case {idx + 1} {res.passed ? '✓ Passed' : '✗ Failed'}
                                            </span>
                                            {res.isPublic && <span className="text-xs bg-gray-700 px-1 rounded text-gray-300">Sample</span>}
                                        </div>

                                        <div className="space-y-2 text-gray-300 text-xs font-mono">
                                            {res.input && (
                                                <div className="bg-black/30 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Input</span>
                                                    <span className="whitespace-pre-wrap">{res.input}</span>
                                                </div>
                                            )}
                                            {res.expected && (
                                                <div className="bg-black/30 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Expected Output</span>
                                                    <span className="whitespace-pre-wrap">{res.expected}</span>
                                                </div>
                                            )}

                                            {res.explanation && (
                                                <div className="bg-blue-900/20 p-2 rounded border border-blue-900/30">
                                                    <span className="text-blue-400 block mb-1 uppercase text-[10px]">Explanation</span>
                                                    <span className="whitespace-pre-wrap text-blue-100">{res.explanation}</span>
                                                </div>
                                            )}

                                            {res.error ? (
                                                <div className="bg-red-900/30 p-2 rounded border border-red-900/50">
                                                    <span className="text-red-400 block mb-1 uppercase text-[10px]">Error</span>
                                                    <span className="whitespace-pre-wrap text-red-200 font-mono text-xs">{res.error}</span>
                                                </div>
                                            ) : (
                                                <div className={`p-2 rounded ${res.passed ? 'bg-black/30' : 'bg-red-900/20'}`}>
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Your Output</span>
                                                    <span className="whitespace-pre-wrap">
                                                        {res.actual || <span className="text-gray-600 italic">(Empty output)</span>}
                                                    </span>
                                                </div>
                                            )}

                                            {!res.passed && !res.actual && !res.error && (
                                                <div className="text-indigo-400 text-[10px] mt-1">
                                                    Hint: Did you forget to print your result?
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Debug dump for development */}
                                <div className="mt-4 pt-4 border-t border-gray-800 text-gray-600">
                                    <details>
                                        <summary>Raw Debug Info</summary>
                                        <pre className="mt-2 p-2 bg-black rounded text-[10px] overflow-auto max-h-40">
                                            {JSON.stringify(results, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 italic">
                                Run code to see test results...
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t border-gray-200 p-3 shrink-0 flex justify-between items-center z-20">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={useCustomInput}
                            onChange={(e) => setUseCustomInput(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 text-sm font-medium">Test against custom input</span>
                    </label>

                    <div className="flex gap-3">
                        <button
                            onClick={handleRun}
                            disabled={running}
                            className={`px-4 py-2 rounded text-sm font-semibold border transition-all ${running
                                ? 'bg-gray-100 text-gray-400 border-gray-200'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {running ? 'Running...' : 'Run Code'}
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={running}
                            className={`px-4 py-2 rounded text-sm font-semibold text-white transition-all ${running
                                ? 'bg-green-700 opacity-50'
                                : 'bg-green-600 hover:bg-green-700 shadow-sm'}`}
                        >
                            Submit Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from 'react';

export default function Card({
    children,
    className = '',
    variant = 'default',
    onClick,
    hover = false
}) {
    const baseClasses = 'card'; // Uses the new @apply class from index.css

    const variantClasses = {
        default: '',
        compact: 'p-4',
        stat: 'p-6',
    };

    const hoverClass = hover || onClick ? 'card-hover cursor-pointer' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`;

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
}

export function StatCard({ title, value, icon, trend, className = '', color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <Card variant="stat" className={`relative overflow-hidden ${className}`} hover>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
                    {icon}
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center bg-gray-50 px-2 py-0.5 rounded-full`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                    <span className="text-sm text-gray-400 ml-2">vs last month</span>
                </div>
            )}
        </Card>
    );
}

import React from 'react';

export default function Card({
    children,
    className = '',
    variant = 'default',
    onClick,
    hover = false
}) {
    const baseClasses = 'bg-white rounded-lg shadow';

    const variantClasses = {
        default: 'p-6',
        compact: 'p-4',
        stat: 'p-6 text-center',
    };

    const hoverClass = hover || onClick ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`;

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
}

export function StatCard({ title, value, icon, trend, className = '' }) {
    return (
        <Card variant="stat" className={className}>
            <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">{icon}</div>
                {trend && (
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600 mt-1">{title}</div>
        </Card>
    );
}


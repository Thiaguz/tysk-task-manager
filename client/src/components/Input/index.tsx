import React from 'react';

import './style.scss';

// TODO: Use validatorjs to validate based on type

type InputProps = {
    type: string;
    name?: string;
    placeholder?: string;
    required?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
    autoComplete?: 'username' | 'current-password' | 'new-password' | 'off' | 'on';
};

const Input: React.FC<InputProps> = ({
    type,
    name,
    placeholder,
    required,
    onChange,
    onBlur,
    value = '',
    disabled,
    autoComplete = 'off',
    className = '',
    autoFocus,
}: InputProps) => {
    return (
        <input
            className={`Input ${className}`}
            type={type}
            name={name}
            placeholder={placeholder}
            required={required}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete={autoComplete}

        />
    );
};

export default Input;

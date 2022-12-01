import React from 'react';

export const Tint = ({amount, in1, result}: {
        amount: string;
        in1: string;
        result: string;
    }) =>
    <feColorMatrix
        type="matrix"
        values={amount}
        in={in1}
        result={result}
    />
;

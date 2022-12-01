import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

function Entry() {
    return (
        <App />
    );
}

const root = ReactDOM.render(<Entry />, document.getElementById('root'));

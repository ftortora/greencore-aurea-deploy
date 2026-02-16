import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto py-8 border-t border-dark-800/40 bg-dark-950/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <p className="text-sm font-bold text-dark-100 uppercase tracking-wider">
                        Green Core <span className="text-aurea-500">AUREA</span>
                    </p>
                    <p className="text-[11px] text-dark-500 mt-1">
                        Energy Management System &copy; {new Date().getFullYear()}
                        <br />
                        Epicode Full Stack Developer Capstone
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end text-center md:text-right">
                    <p className="text-xs font-medium text-dark-200">
                        Sviluppato da <span className="text-aurea-400">Francesco Tortora</span>
                    </p>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[9px] px-2 py-0.5 bg-dark-800 rounded border border-dark-700 text-dark-400 tracking-tighter">REACT</span>
                        <span className="text-[9px] px-2 py-0.5 bg-dark-800 rounded border border-dark-700 text-dark-400 tracking-tighter">NODE.JS</span>
                        <span className="text-[9px] px-2 py-0.5 bg-dark-800 rounded border border-dark-700 text-dark-400 tracking-tighter">MONGODB</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
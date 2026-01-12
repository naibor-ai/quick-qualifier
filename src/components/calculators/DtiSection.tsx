'use client';

import { useTranslations } from 'next-intl';
import { useCalculatorStore } from '@/lib/store';
import { InputGroup, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';
import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

export function DtiSection() {
    const t = useTranslations();
    const pathname = usePathname();

    const calculatorType = useMemo(() => {
        if (pathname.includes('/conventional-refi')) return 'conventionalRefi';
        if (pathname.includes('/fha-refi')) return 'fhaRefi';
        if (pathname.includes('/va-refi')) return 'vaRefi';
        if (pathname.includes('/conventional')) return 'conventional';
        if (pathname.includes('/fha')) return 'fha';
        if (pathname.includes('/va')) return 'va';
        return 'conventional';
    }, [pathname]);

    const {
        dtiInputs: allDtiInputs,
        updateDtiInputs,
        setDtiResult,
        dtiResults: allDtiResults,
        conventionalResult,
        fhaResult,
        vaResult,
        conventionalRefiResult,
        fhaRefiResult,
        vaRefiResult,
    } = useCalculatorStore();

    const dtiInputs = allDtiInputs[calculatorType] || { incomes: [0, 0, 0, 0, 0, 0], payments: [0, 0, 0, 0, 0, 0] };
    const dtiResult = allDtiResults[calculatorType] || null;

    // Get the active PITI from whichever calculator is active
    const piti = useMemo(() => {
        switch (calculatorType) {
            case 'conventional': return conventionalResult?.monthlyPayment.totalMonthly || 0;
            case 'fha': return fhaResult?.monthlyPayment.totalMonthly || 0;
            case 'va': return vaResult?.monthlyPayment.totalMonthly || 0;
            case 'conventionalRefi': return conventionalRefiResult?.monthlyPayment.totalMonthly || 0;
            case 'fhaRefi': return fhaRefiResult?.monthlyPayment.totalMonthly || 0;
            case 'vaRefi': return vaRefiResult?.monthlyPayment.totalMonthly || 0;
            default: return 0;
        }
    }, [calculatorType, conventionalResult, fhaResult, vaResult, conventionalRefiResult, fhaRefiResult, vaRefiResult]);

    const handleInputChange = (type: 'incomes' | 'payments', index: number, value: string) => {
        const newVal = Number(value) || 0;
        const currentList = [...dtiInputs[type]];
        currentList[index] = newVal;
        updateDtiInputs({ [type]: currentList }, calculatorType);
    };

    const calculateDti = useCallback(() => {
        const totalIncome = dtiInputs.incomes.reduce((acc, val) => acc + val, 0);
        const totalPayments = dtiInputs.payments.reduce((acc, val) => acc + val, 0);

        if (totalIncome === 0) {
            setDtiResult({ frontendRatio: 0, backendRatio: 0 }, calculatorType);
            return;
        }

        const frontendRatio = (piti / totalIncome) * 100;
        const backendRatio = ((totalPayments + piti) / totalIncome) * 100;

        setDtiResult({
            frontendRatio: Math.round(frontendRatio * 100) / 100,
            backendRatio: Math.round(backendRatio * 100) / 100,
        }, calculatorType);
    }, [dtiInputs, piti, setDtiResult, calculatorType]);

    return (
        <Card className="mt-6 border-blue-200 shadow-lg rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-[2rem]">
                <CardTitle className="text-lg font-bold text-slate-800">
                    DTI Calculation
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-700 mb-2">Monthly Income</h4>
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <InputGroup
                                key={`income-${idx}`}
                                label={`Income #${idx + 1}`}
                                name={`income-${idx}`}
                                type="number"
                                value={dtiInputs.incomes[idx]}
                                onChange={(val) => handleInputChange('incomes', idx, val)}
                                prefix="$"
                            />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-700 mb-2">Monthly Payments</h4>
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <InputGroup
                                key={`payment-${idx}`}
                                label={`Payment #${idx + 1}`}
                                name={`payment-${idx}`}
                                type="number"
                                value={dtiInputs.payments[idx]}
                                onChange={(val) => handleInputChange('payments', idx, val)}
                                prefix="$"
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Total/Mo Income</p>
                            <p className="text-2xl font-bold text-blue-900">
                                ${dtiInputs.incomes.reduce((acc, val) => acc + val, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Total/Mo Payments</p>
                            <p className="text-2xl font-bold text-slate-900">
                                ${dtiInputs.payments.reduce((acc, val) => acc + val, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {dtiResult && (
                        <div className="grid grid-cols-2 gap-8">
                            {(() => {
                                const isConventional = pathname.includes('/conventional');
                                const isFha = pathname.includes('/fha');
                                const isVa = pathname.includes('/va');

                                let frontThreshold = 50;
                                let backThreshold = 50;

                                if (isConventional) {
                                    frontThreshold = 49.9;
                                    backThreshold = 49.9;
                                } else if (isFha || isVa) {
                                    frontThreshold = 46.99;
                                    backThreshold = 56.99;
                                }

                                return (
                                    <>
                                        <div className="relative bg-emerald-50 pl-10 pr-6 py-5 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
                                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(250,204,21,0.6)] border-2 border-white z-10 transition-transform hover:scale-110">
                                                {dtiResult.frontendRatio <= frontThreshold ? '😊' : '🙁'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Frontend Ratio</p>
                                                <p className="text-2xl font-bold text-emerald-900">
                                                    {dtiResult.frontendRatio}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative bg-emerald-50 pl-6 pr-10 py-5 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Backend Ratio</p>
                                                <p className="text-2xl font-bold text-emerald-900">
                                                    {dtiResult.backendRatio}%
                                                </p>
                                            </div>
                                            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(250,204,21,0.6)] border-2 border-white z-10 transition-transform hover:scale-110">
                                                {dtiResult.backendRatio <= backThreshold ? '😊' : '🙁'}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    <Button
                        fullWidth
                        size="lg"
                        onClick={calculateDti}
                        className="bg-white hover:bg-slate-50 text-[#2a8bb3] font-black py-4 shadow-sm border border-slate-200 transition-all active:scale-95"
                    >
                        Calculate Totals & View Ratios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

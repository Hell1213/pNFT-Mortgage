'use client';

import React, { useEffect, useState } from 'react';
import { useLoans } from '@/hooks/useLoans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoanStatus } from '@/types/loan';

export default function DashboardPage() {
  const { loans, loading, error, fetchLoans } = useLoans();
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalValue: 0,
    liquidatedLoans: 0,
  });

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    const activeLoans = loans.filter(loan => loan.status === LoanStatus.Active);
    const liquidatedLoans = loans.filter(loan => loan.status === LoanStatus.Liquidated);
    const totalValue = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);

    setStats({
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      totalValue,
      liquidatedLoans: liquidatedLoans.length,
    });
  }, [loans]);

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.Active:
        return 'text-green-600 bg-green-100';
      case LoanStatus.Liquidated:
        return 'text-red-600 bg-red-100';
      case LoanStatus.Repaid:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.Active:
        return 'Active';
      case LoanStatus.Liquidated:
        return 'Liquidated';
      case LoanStatus.Repaid:
        return 'Repaid';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/create-loan">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Loan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalValue.toFixed(2)} SOL
              </div>
              <p className="text-sm text-gray-600">Total Value Locked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.activeLoans}
              </div>
              <p className="text-sm text-gray-600">Active Loans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.totalLoans}
              </div>
              <p className="text-sm text-gray-600">Total Loans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.liquidatedLoans}
              </div>
              <p className="text-sm text-gray-600">Liquidated</p>
            </CardContent>
          </Card>
        </div>

        {/* Loans List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Loans</CardTitle>
            <CardDescription>
              Manage your active loans and view loan history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-600 text-sm mb-4">
                Error: {error}
              </div>
            )}

            {loans.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans found</h3>
                <p className="text-gray-600 mb-4">You haven't created any loans yet.</p>
                <Link href="/create-loan">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create Your First Loan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">Loan #{loan.id.slice(-6)}</h3>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(loan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {getStatusText(loan.status)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Loan Amount</p>
                        <p className="font-semibold">{loan.loanAmount} SOL</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Outstanding</p>
                        <p className="font-semibold">{loan.outstandingAmount} SOL</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interest Rate</p>
                        <p className="font-semibold">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Health Ratio</p>
                        <p className="font-semibold">{loan.healthRatio}%</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Collateral: {loan.collateralValue.toFixed(2)} SOL
                      </div>
                      <div className="space-x-2">
                        {loan.status === LoanStatus.Active && (
                          <>
                            <Button size="sm" variant="outline">
                              Repay
                            </Button>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

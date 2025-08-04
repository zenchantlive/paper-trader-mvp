'use client';

import { Portfolio, Holding } from '@/lib/types';

interface PortfolioSectionProps {
  portfolio: Portfolio;
}

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-baseline">
          <h3 className="text-lg font-medium text-gray-700">Cash Balance</h3>
          <p className="text-xl font-bold text-gray-900">${portfolio.cash.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Holdings</h3>
        {portfolio.holdings.length === 0 ? (
          <p className="text-gray-500 italic">You have no holdings yet.</p>
        ) : (
          <div className="space-y-3">
            {portfolio.holdings.map((holding: Holding) => (
              <div key={holding.ticker} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{holding.ticker}</p>
                  <p className="text-sm text-gray-500">{holding.shares} shares @ ${holding.averagePrice.toFixed(2)}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(holding.shares * holding.averagePrice).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xl font-semibold text-gray-800">Total Value</h3>
          <p className="text-2xl font-bold text-indigo-600">${portfolio.totalValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Portfolio, Holding } from '@/lib/types';

interface PortfolioSectionProps {
  portfolio: Portfolio;
}

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Portfolio</h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Cash Balance</h3>
          <p className="text-lg font-bold text-gray-900 dark:text-white">${portfolio.cash.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Holdings</h3>
        {portfolio.holdings.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">You have no holdings yet.</p>
        ) : (
          <div className="space-y-2">
            {portfolio.holdings.map((holding: Holding) => (
              <div key={holding.ticker} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{holding.ticker}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{holding.shares} shares @ ${holding.averagePrice.toFixed(2)}</p>
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  ${(holding.shares * holding.averagePrice).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
        <div className="flex justify-between items-baseline">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Value</h3>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${portfolio.totalValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

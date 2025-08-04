'use client';

import { useEffect } from 'react';
import { TradeConfirmation } from '@/lib/types';

interface ConfirmationModalProps {
  isOpen: boolean;
  tradeData: TradeConfirmation;
  userCash: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  tradeData,
  userCash,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isBuy = tradeData.type === 'buy';
  const hasInsufficientFunds = isBuy && userCash < tradeData.total;
  const hasInsufficientShares = !isBuy && (!tradeData.currentHolding || tradeData.currentHolding.shares < tradeData.quantity);
  const canExecute = !hasInsufficientFunds && !hasInsufficientShares;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Confirm {isBuy ? 'Purchase' : 'Sale'}
          </h2>
        </div>

        {/* Trade Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Stock:</span>
            <span className="font-medium text-gray-900 dark:text-white">{tradeData.ticker}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
            <span className="font-medium text-gray-900 dark:text-white">{tradeData.quantity} shares</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Price per share:</span>
            <span className="font-medium text-gray-900 dark:text-white">${tradeData.price.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900 dark:text-white">Total {isBuy ? 'Cost' : 'Proceeds'}:</span>
              <span className={isBuy ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                ${isBuy ? '-' : '+'}{tradeData.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Holdings Info */}
        {tradeData.currentHolding && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Holdings:</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {tradeData.currentHolding.shares} shares @ ${tradeData.currentHolding.averagePrice.toFixed(2)} avg
            </p>
          </div>
        )}

        {/* Warnings */}
        {hasInsufficientFunds && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Insufficient funds. You need ${tradeData.total.toFixed(2)} but only have ${userCash.toFixed(2)}.
            </p>
          </div>
        )}

        {hasInsufficientShares && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              Insufficient shares. You need {tradeData.quantity} shares but only have {tradeData.currentHolding?.shares || 0}.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canExecute}
            className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isBuy
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
            }`}
          >
            Confirm {isBuy ? 'Purchase' : 'Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}
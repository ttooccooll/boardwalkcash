import ClipboardButton from '@/components/buttons/utility/ClipboardButton';
import ActiveAndInactiveAmounts from '../utility/amounts/ActiveAndInactiveAmounts';
import { useCashuContext } from '@/hooks/contexts/cashuContext';
import { useExchangeRate } from '@/hooks/util/useExchangeRate';
import { decodeBolt11 } from '@/utils/bolt11';
import { useState, useEffect } from 'react';
import { usePolling } from '@/hooks/util/usePolling';
import useWallet from '@/hooks/boardwalk/useWallet';
import { MintQuoteState } from '@cashu/cashu-ts';
import { useToast } from '@/hooks/util/useToast';
import QRCode from 'qrcode.react';
import { getMsgFromUnknownError } from '@/utils/error';

interface WaitForLightningInvoicePaymentProps {
   onSuccess: () => void;
   checkingId: string;
   invoice: string;
}

export const WaitForLightningInvoicePayment = ({
   invoice,
   checkingId,
   onSuccess,
}: WaitForLightningInvoicePaymentProps) => {
   const { satsToUnit } = useExchangeRate();
   const { activeUnit } = useCashuContext();
   const { tryToMintProofs } = useWallet();
   const { addToast } = useToast();
   const [amountData, setAmountData] = useState<{
      amountUsdCents: number;
      amountSat: number;
   } | null>(null);

   useEffect(() => {
      const { amountSat } = decodeBolt11(invoice);
      if (!amountSat) {
         /* amountless invoice isn't possible bc cashu doesn't support it */
         return;
      }
      satsToUnit(amountSat, 'usd').then(amountUsdCents => {
         setAmountData({ amountUsdCents, amountSat });
      });
   }, [invoice, satsToUnit]);

   const checkPaymentStatus = async () => {
      try {
         const status = await tryToMintProofs(checkingId);
         if (status === MintQuoteState.ISSUED) {
            onSuccess();
            setAmountData(null);
         } else if (status === 'EXPIRED') {
            addToast('Invoice expired.', 'warning');
         }
         console.log('quote not paid', status);
      } catch (error) {
         console.error('Error fetching payment status', error);
         addToast(getMsgFromUnknownError(error), 'error');
      }
   };

   const { isPolling } = usePolling(checkPaymentStatus, 5_000, 60_000);

   return (
      <div className='flex flex-col items-center justify-around space-y-4 text-gray-500 h-full'>
         <div className='flex flex-col items-center justify-center space-y-4 text-gray-500'>
            {amountData && (
               <ActiveAndInactiveAmounts
                  satAmount={amountData.amountSat}
                  usdCentsAmount={amountData.amountUsdCents}
                  activeUnit={activeUnit}
               />
            )}
            <QRCode value={invoice} size={256} />
            <p className='text-center text-sm'>Scan with any Lightning wallet</p>
         </div>
         <ClipboardButton
            toCopy={invoice}
            toShow='Copy Invoice'
            className='btn-primary hover:!bg-[var(--btn-primary-bg)]'
         />
         <div>
            {!isPolling && (
               <div className='flex flex-col items-center justify-center text-center space-y-1 text-black'>
                  <p className='text-xs'>Timed out waiting for payment...</p>
                  <button onClick={checkPaymentStatus} className='underline'>
                     Check again
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

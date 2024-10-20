import { useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import clsx from 'clsx';
import { Drawer } from 'antd';
import styled from 'styled-components';

import { Modal } from '@/renderer/components/Modal/Modal';
import { getTokenSymbol } from '@/renderer/utils';
import { isSameAddress } from '@/renderer/utils/address';
import { useSwapSupportedDexList } from '@/renderer/hooks/rabbyx/useSwap';
import RcIconHiddenArrow from '@/../assets/icons/swap/hidden-quote-arrow.svg?rc';

import { Checkbox } from '@/renderer/components/Checkbox';
import { isSwapWrapToken, TDexQuoteData } from '../utils';
import { DEX_WITH_WRAP } from '../constant';
import { refreshIdAtom } from '../atom';

import { DexQuoteItem, QuoteItemProps } from './QuoteItem';
import { QuoteListLoading, QuoteLoading } from './QuoteLoading';
import { IconRefresh } from './IconRefresh';

interface QuotesProps
  extends Omit<
    QuoteItemProps,
    | 'bestQuoteAmount'
    | 'bestQuoteGasUsd'
    | 'name'
    | 'quote'
    | 'active'
    | 'isBestQuote'
    | 'quoteProviderInfo'
  > {
  list?: TDexQuoteData[];
  activeName?: string;
  visible: boolean;
  onClose: () => void;
}

export const Quotes = ({
  list,
  activeName,
  inSufficient,
  sortIncludeGasFee,
  ...other
}: QuotesProps) => {
  const { t } = useTranslation();

  const sortedList = useMemo(
    () => [
      ...(list?.sort((a, b) => {
        const getNumber = (quote: typeof a) => {
          const price = other.receiveToken.price ? other.receiveToken.price : 0;
          if (inSufficient) {
            return new BigNumber(quote.data?.toTokenAmount || 0)
              .div(
                10 **
                  (quote.data?.toTokenDecimals || other.receiveToken.decimals)
              )
              .times(price);
          }
          if (!quote.preExecResult) {
            return new BigNumber(Number.MIN_SAFE_INTEGER);
          }
          const receiveTokenAmount =
            quote?.preExecResult.swapPreExecTx.balance_change.receive_token_list.find(
              (item) => isSameAddress(item.id, other.receiveToken.id)
            )?.amount || 0;
          if (sortIncludeGasFee) {
            return new BigNumber(receiveTokenAmount)
              .times(price)
              .minus(quote?.preExecResult?.gasUsdValue || 0);
          }

          return new BigNumber(receiveTokenAmount).times(price);
        };
        return getNumber(b).minus(getNumber(a)).toNumber();
      }) || []),
    ],
    [inSufficient, list, other.receiveToken, sortIncludeGasFee]
  );

  const [bestQuoteAmount, bestQuoteGasUsd] = useMemo(() => {
    const bestQuote = sortedList?.[0];
    const receiveTokenAmount = bestQuote?.preExecResult
      ? bestQuote.preExecResult.swapPreExecTx.balance_change.receive_token_list.find(
          (item) => isSameAddress(item.id, other.receiveToken.id)
        )?.amount || 0
      : 0;

    return [
      inSufficient
        ? new BigNumber(bestQuote.data?.toTokenAmount || 0)
            .div(
              10 **
                (bestQuote?.data?.toTokenDecimals ||
                  other.receiveToken.decimals ||
                  1)
            )
            .toString(10)
        : receiveTokenAmount,
      bestQuote?.isDex ? bestQuote.preExecResult?.gasUsdValue || '0' : '0',
    ];
  }, [inSufficient, other?.receiveToken, sortedList]);

  const fetchedList = useMemo(() => list?.map((e) => e.name) || [], [list]);
  const [hiddenError, setHiddenError] = useState(true);
  const [errorQuoteDEXs, setErrorQuoteDEXs] = useState<string[]>([]);

  const [dexList] = useSwapSupportedDexList();
  const dexListLength = dexList.length;

  if (isSwapWrapToken(other.payToken.id, other.receiveToken.id, other.chain)) {
    const dex = sortedList.find((e) => e.isDex) as TDexQuoteData | undefined;

    return (
      <div className="flex flex-col gap-8 overflow-hidden">
        {dex ? (
          <DexQuoteItem
            inSufficient={inSufficient}
            preExecResult={dex?.preExecResult}
            quote={dex?.data}
            name={dex?.name}
            isBestQuote
            bestQuoteAmount={`${
              dex?.preExecResult?.swapPreExecTx.balance_change.receive_token_list.find(
                (token) => isSameAddress(token.id, other.receiveToken.id)
              )?.amount || '0'
            }`}
            bestQuoteGasUsd={bestQuoteGasUsd}
            isLoading={dex.loading}
            quoteProviderInfo={{
              name: t('page.swap.wrap-contract'),
              logo: other?.receiveToken?.logo_url,
            }}
            sortIncludeGasFee={sortIncludeGasFee}
            {...other}
          />
        ) : (
          <QuoteLoading
            name={t('page.swap.wrap-contract')}
            logo={other?.receiveToken?.logo_url}
          />
        )}

        <div className="text-13 text-r-neutral-foot">
          {t('page.swap.directlySwap', {
            symbol: getTokenSymbol(other.payToken),
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden">
      <div className="flex flex-col gap-16">
        {sortedList.map((params, idx) => {
          const { name, data, isDex } = params;
          if (!isDex) return null;
          return (
            <DexQuoteItem
              onErrQuote={setErrorQuoteDEXs}
              key={name}
              inSufficient={inSufficient}
              preExecResult={params.preExecResult}
              quote={data as unknown as any}
              name={name}
              isBestQuote={idx === 0}
              bestQuoteAmount={`${bestQuoteAmount}`}
              bestQuoteGasUsd={bestQuoteGasUsd}
              isLoading={params.loading}
              quoteProviderInfo={
                DEX_WITH_WRAP[name as keyof typeof DEX_WITH_WRAP]
              }
              sortIncludeGasFee={sortIncludeGasFee}
              {...other}
            />
          );
        })}

        <QuoteListLoading fetchedList={fetchedList} />
      </div>
      <div
        className={clsx(
          'flex items-center justify-center my-8 mt-32 cursor-pointer gap-4',
          errorQuoteDEXs.length === 0 ||
            errorQuoteDEXs?.length === dexListLength
            ? 'hidden'
            : 'mb-16'
        )}
        onClick={() => setHiddenError((e) => !e)}
      >
        <span className="text-13 text-r-neutral-foot gap-4 ">
          {t('page.swap.hidden-no-quote-rates', {
            count: errorQuoteDEXs.length,
          })}
        </span>
        <RcIconHiddenArrow
          viewBox="0 0 14 14"
          className={clsx('w-14 h-14', !hiddenError && '-rotate-180')}
        />
      </div>
      <div
        className={clsx(
          'flex flex-col gap-8 transition overflow-hidden',
          hiddenError &&
            errorQuoteDEXs?.length !== dexListLength &&
            'max-h-0 h-0',
          errorQuoteDEXs.length === 0 && 'hidden'
        )}
      >
        {sortedList.map((params, idx) => {
          const { name, data, isDex } = params;

          if (!isDex) return null;
          return (
            <DexQuoteItem
              onErrQuote={setErrorQuoteDEXs}
              onlyShowErrorQuote
              key={name}
              inSufficient={inSufficient}
              preExecResult={params.preExecResult}
              quote={data}
              name={name}
              isBestQuote={idx === 0}
              bestQuoteAmount={`${bestQuoteAmount}`}
              bestQuoteGasUsd={bestQuoteGasUsd}
              isLoading={params.loading}
              quoteProviderInfo={
                DEX_WITH_WRAP[name as keyof typeof DEX_WITH_WRAP]
              }
              sortIncludeGasFee={sortIncludeGasFee}
              {...other}
            />
          );
        })}
      </div>
    </div>
  );
};

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    background: transparent;
  }
  .ant-drawer-body {
    padding: 24px;
    border-radius: 16px;
    background: var(--r-neutral-bg2, #3d4251);
    box-shadow: 0px -12px 20px 0px rgba(35, 47, 129, 0.1);
    overflow: hidden;
  }
  .ant-drawer-mask {
    position: fixed;
  }
`;

export const QuoteList = (props: Omit<QuotesProps, 'sortIncludeGasFee'>) => {
  const { visible, onClose } = props;
  const refreshQuote = useSetAtom(refreshIdAtom);

  const { t } = useTranslation();

  const [sortIncludeGasFee, setSortIncludeGasFee] = useState(true);

  useEffect(() => {
    if (!visible) {
      setSortIncludeGasFee(true);
    }
  }, [visible]);

  return (
    <StyledDrawer
      placement="bottom"
      getContainer={false}
      width={528}
      height="auto"
      maskClosable
      onClose={onClose}
      open={visible}
      closable={false}
      destroyOnClose
    >
      <div className="flex items-center justify-between mb-[20px]">
        <div className="flex items-center text-left text-r-neutral-title-1 text-[16px] font-medium ">
          <div className="text-14 font-medium text-r-neutral-body">
            {t('page.swap.the-following-swap-rates-are-found')}
          </div>
          <div className="w-[26px] h-[26px] relative translate-x-[-50%] translate-y-[-50%]">
            <IconRefresh onClick={refreshQuote} />
          </div>
        </div>

        <Checkbox
          checked={!!sortIncludeGasFee}
          onChange={setSortIncludeGasFee}
          className="text-14 font-medium text-rabby-neutral-body"
          width="14px"
          height="14px"
          type="square"
          background="transparent"
          unCheckBackground="transparent"
          checkIcon={
            sortIncludeGasFee ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  fill="var(--r-blue-default)"
                  d="M12.103.875H1.898a1.02 1.02 0 0 0-1.02 1.02V12.1c0 .564.456 1.02 1.02 1.02h10.205a1.02 1.02 0 0 0 1.02-1.02V1.895a1.02 1.02 0 0 0-1.02-1.02Z"
                />
                <path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.05}
                  d="m4.2 7.348 2.1 2.45 4.2-4.9"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="var(--r-neutral-foot)"
                  strokeLinejoin="round"
                  strokeWidth={0.75}
                  d="M12.103.875H1.898a1.02 1.02 0 0 0-1.02 1.02V12.1c0 .564.456 1.02 1.02 1.02h10.205a1.02 1.02 0 0 0 1.02-1.02V1.895a1.02 1.02 0 0 0-1.02-1.02Z"
                />
              </svg>
            )
          }
        >
          <span className="ml-[-4px] text-r-neutral-body text-14 font-medium">
            {t('page.swap.sort-with-gas')}
          </span>
        </Checkbox>
      </div>
      <Quotes {...props} sortIncludeGasFee={sortIncludeGasFee} />
    </StyledDrawer>
  );
};

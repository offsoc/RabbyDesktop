import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TestnetChain } from '@/isomorphic/types/customTestnet';
import styled from 'styled-components';
import { TestnetChainLogo } from './TestnetChainLogo';

const ImgWraper = styled.span`
  cursor: pointer;
  margin-top: 1px;
  display: flex;
  img {
    flex: 1;
  }
  .hover-img {
    margin-top: 1px;
    display: none;
  }
  &:hover {
    img {
      display: none;
    }
    img.hover-img {
      display: inline-block;
    }
  }
`;

export const CustomTestnetItem = ({
  className,
  item,
  onEdit,
  onRemove,
  onClick,
  editable,
  disabled,
}: {
  className?: string;
  item: TestnetChain;
  onEdit?: (item: TestnetChain) => void;
  onRemove?: (item: TestnetChain) => void;
  onClick?: (item: TestnetChain) => void;
  editable?: boolean;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        'flex items-center gap-[12px] px-[15px] py-[10px]',
        'border-[1px] border-solid border-transparent rounded-[6px]',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-rabby-blue-default hover:bg-r-blue-light1 cursor-pointer',
        'group',
        className
      )}
      onClick={() => {
        onClick?.(item);
      }}
    >
      <TestnetChainLogo name={item.name} className="flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[15px] leading-[18px] mb-[2px] font-medium text-r-neutral-title1">
          {item.name}
        </div>
        <div className="flex items-center gap-[16px]">
          <div className="text-[12px] leading-[14px] text-r-neutral-foot">
            {t('page.customTestnet.currency')}:{' '}
            <span className="text-r-neutral-body">
              {item.nativeTokenSymbol}
            </span>
          </div>
          <div className="text-[12px] leading-[14px] text-r-neutral-foot">
            {t('page.customTestnet.id')}:{' '}
            <span className="text-r-neutral-body">{item.id}</span>
          </div>
        </div>
      </div>
      {editable ? (
        <div className="group-hover:visible flex items-center gap-[12px] ml-auto invisible">
          <img
            className="cursor-pointer"
            src="rabby-internal://assets/icons/custom-testnet/icon-edit.svg"
            onClick={() => {
              onEdit?.(item);
            }}
          />
          <ImgWraper
            onClick={() => {
              onRemove?.(item);
            }}
          >
            <img src="rabby-internal://assets/icons/custom-testnet/icon-delete.svg" />
            <img
              className="hover-img"
              src="rabby-internal://assets/icons/custom-testnet/icon-delete-hover.svg"
            />
          </ImgWraper>
        </div>
      ) : null}
    </div>
  );
};

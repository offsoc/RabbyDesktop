import { Modal } from '@/renderer/components/Modal/Modal';
import { visibleTokenListAtom } from '@/renderer/components/TokenActionModal/TokenActionModal';
import { useTokenAtom } from '@/renderer/hooks/rabbyx/useToken';
import { TokenItem } from '@rabby-wallet/rabby-api/dist/types';
import { Button } from 'antd';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import React from 'react';
import { CustomTestnetTokenTable } from '../CustomTestnetTokenTable/CustomTestnetTokenTable';

export interface Props {
  label: string;
  onAddClick?: () => void;
  tokens?: TokenItem[];
  description?: string;
  hiddenSubTitle?: boolean;
}

const TokenButton: React.FC<Props> = ({
  label,
  tokens,
  description,
  hiddenSubTitle,
  onAddClick,
}) => {
  const [visible, setVisible] = React.useState(false);
  const len = tokens?.length ?? 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setVisible(true)}
        className={clsx(
          'rounded-[2px] p-6',
          'text-12 bg-[#FFFFFF0F] text-[#D3D8E0]',
          'flex items-center',
          'gap-2',
          'hover:opacity-60',
          'border-none outline-none',
          'cursor-pointer'
        )}
      >
        <span>{len}</span>
        <span>{label}</span>
        <img
          src="rabby-internal://assets/icons/home/expand-arrow.svg"
          className="w-[14px] h-[5px] transform rotate-90"
        />
      </button>

      <Modal
        bodyStyle={{ height: 503, padding: '0 20px 0' }}
        width={400}
        open={visible}
        onCancel={() => setVisible(false)}
        title={`${len} ${label}`}
        smallTitle
        centered
        subtitle={
          !hiddenSubTitle && (
            <div className="text-[13px] text-r-neutral-foot leading-[16px]">
              The token in this list will not be added to total balance
            </div>
          )
        }
      >
        <CustomTestnetTokenTable
          isShowHeader={false}
          list={tokens}
          EmptyComponent={
            <div className="space-y-24 text-13 text-center mt-[100px]">
              <img
                src="rabby-internal://assets/icons/home/low-value-empty.svg"
                className="w-[52px] h-[52px] m-auto"
              />
              <div className="text-[#BABEC5]">{description}</div>
            </div>
          }
          FooterComponent={
            <div className="h-[92px]">
              <div
                className={clsx(
                  'p-[20px] border-t-rabby-neutral-line border-0 border-t-[0.5px] border-solid',
                  'absolute right-0 left-0 bottom-0',
                  'bg-r-neutral-bg-1'
                )}
              >
                <Button
                  type="primary"
                  block
                  size="large"
                  className="text-[16px] font-medium leading-[19px] rounded-[8px] h-[52px]"
                  icon={
                    <img
                      src="rabby-internal://assets/icons/home/add-circle.svg"
                      className="mr-[4px]"
                    />
                  }
                  onClick={onAddClick}
                >
                  Add Token
                </Button>
              </div>
            </div>
          }
        />
      </Modal>
    </div>
  );
};

export const CustomTestnetButton = ({
  onAddClick,
}: Pick<Props, 'onAddClick'>) => {
  const { customTestnet } = useTokenAtom();

  return (
    <TokenButton
      label={
        customTestnet.length > 1
          ? 'custom network tokens'
          : 'custom network token'
      }
      description="No Custom Network Token"
      tokens={customTestnet}
      onAddClick={onAddClick}
    />
  );
};

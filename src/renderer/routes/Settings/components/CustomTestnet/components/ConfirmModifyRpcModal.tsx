import { findChain } from '@/renderer/utils/chain';
import { Button, Modal } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomRPC } from '@/renderer/hooks/useCustomRPC';
import styles from '../index.module.less';
import { EditCustomRPCModal } from '../../CustomRPCModal/EditCustomRPCModal';

export const ConfirmModifyRpcModal = ({
  visible,
  onClose,
  onConfirm,
  chainId,
  rpcUrl,
}: {
  visible: boolean;
  onClose(): void;
  onConfirm(): void;
  chainId?: number;
  rpcUrl?: string;
}) => {
  const { setCustomRPC } = useCustomRPC();
  const { t } = useTranslation();
  const [isShowModifyRpcModal, setIsShowModifyRpcModal] = useState(false);
  const chain = useMemo(() => {
    if (!chainId) {
      return null;
    }
    return findChain({
      id: chainId,
    });
  }, [chainId]);

  const onSaveRpc = async (chainEnum: CHAINS_ENUM, url: string) => {
    await setCustomRPC(chainEnum, url);
    setIsShowModifyRpcModal(false);
    onConfirm();
  };

  const rpc = useMemo(() => {
    if (!rpcUrl) return null;
    return {
      url: rpcUrl,
      enable: true,
    };
  }, [rpcUrl]);

  return (
    <>
      <Modal
        className={styles.modal}
        open={visible}
        onCancel={onClose}
        zIndex={1003}
        bodyStyle={{
          padding: 0,
          background: 'var(--r-neutral-bg1, #FFF)',
        }}
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        width={360}
        footer={null}
        closable={false}
        centered
      >
        <div>
          <div className="pt-[30px] px-[20px]">
            <div className="text-r-neutral-title-1 text-[16px] font-medium leading-[20px] text-center">
              {t('page.customTestnet.ConfirmModifyRpcModal.desc')}
            </div>
            <div className="pt-[22px] pb-[25px] flex flex-col items-center">
              <img
                src={chain?.logo}
                alt=""
                className="w-[32px] h-[32px] mb-[8px]"
              />
              <div className="text-[15px] font-medium leading-[18px] text-r-neutral-title-1 mb-[8px]">
                {chain?.name}
              </div>
              <div className="text-r-neutral-body text-[15px] w-full text-center">
                {rpcUrl}
              </div>
            </div>
          </div>
          <footer className={styles.modalFooter}>
            <Button
              type="primary"
              size="large"
              className="rabby-btn-ghost w-[172px] rounded-[6px]"
              ghost
              onClick={onClose}
            >
              {t('global.Cancel')}
            </Button>
            <Button
              type="primary"
              size="large"
              className="w-[172px] rounded-[6px]"
              onClick={() => setIsShowModifyRpcModal(true)}
            >
              {t('global.Confirm')}
            </Button>
          </footer>
        </div>
      </Modal>
      <EditCustomRPCModal
        open={isShowModifyRpcModal}
        chain={chain?.enum}
        rpc={rpc}
        onClose={() => {
          setIsShowModifyRpcModal(false);
          onClose();
        }}
        onSubmit={onSaveRpc}
      />
    </>
  );
};

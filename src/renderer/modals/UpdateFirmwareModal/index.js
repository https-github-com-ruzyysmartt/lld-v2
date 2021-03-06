//  @flow
import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { DeviceModelId } from "@ledgerhq/devices";
import type { FirmwareUpdateContext } from "@ledgerhq/live-common/lib/types/manager";
import logger from "~/logger";
import Modal from "~/renderer/components/Modal";
import Stepper from "~/renderer/components/Stepper";
import type { StepProps as DefaultStepProps, TypedStep } from "~/renderer/components/Stepper";
import SyncSkipUnderPriority from "~/renderer/components/SyncSkipUnderPriority";
import { FreezeDeviceChangeEvents } from "~/renderer/screens/manager/HookDeviceChange";
import type { ModalStatus } from "~/renderer/screens/manager/FirmwareUpdate/types";
import StepResetDevice, { StepResetFooter } from "./steps/00-step-reset-device";
import StepFullFirmwareInstall from "./steps/01-step-install-full-firmware";
import StepFlashMcu from "./steps/02-step-flash-mcu";
import StepConfirmation, { StepConfirmFooter } from "./steps/03-step-confirmation";

type MaybeError = ?Error;

export type StepProps = DefaultStepProps & {
  firmware: FirmwareUpdateContext,
  onCloseModal: () => void,
  error: ?Error,
  setError: Error => void,
  deviceModelId: DeviceModelId,
};

export type StepId = "idCheck" | "updateMCU" | "finish" | "resetDevice";

type Step = TypedStep<StepId>;

type Props = {
  status: ModalStatus,
  onClose: () => void,
  firmware: ?FirmwareUpdateContext,
  stepId: StepId,
  error: ?Error,
  deviceModelId: DeviceModelId,
};

const UpdateModal = ({
  stepId,
  deviceModelId,
  error,
  status,
  onClose,
  firmware,
  ...props
}: Props) => {
  const [stateStepId, setStateStepId] = useState<StepId>(stepId);
  const [err, setErr] = useState<MaybeError>(error || null);
  const [nonce, setNonce] = useState(0);
  const { t } = useTranslation();

  const createSteps = useCallback(
    ({ deviceModel }: { deviceModel: DeviceModelId }) => {
      const updateStep = {
        id: "idCheck",
        label: t("manager.modal.identifier"),
        component: StepFullFirmwareInstall,
        footer: null,
        onBack: null,
        hideFooter: true,
      };

      const finalStep = {
        id: "finish",
        label: t("addAccounts.breadcrumb.finish"),
        component: StepConfirmation,
        footer: StepConfirmFooter,
        onBack: null,
        hideFooter: false,
      };

      const mcuStep = {
        id: "updateMCU",
        label: t("manager.modal.steps.updateMCU"),
        component: StepFlashMcu,
        footer: null,
        onBack: null,
        hideFooter: true,
      };

      const resetStep = {
        id: "resetDevice",
        label: t("manager.modal.steps.reset"),
        component: StepResetDevice,
        footer: StepResetFooter,
        onBack: null,
        hideFooter: false,
      };

      let steps = [updateStep, mcuStep, finalStep];
      if (deviceModel === "blue") steps = [resetStep, ...steps];

      return steps;
    },
    [t],
  );

  const steps = useMemo(() => createSteps({ deviceModel: deviceModelId }), [deviceModelId]);
  const stepsId = steps.map(step => step.id);
  const errorSteps = err ? [stepsId.indexOf(stateStepId)] : [];

  const setError = useCallback(
    (e: Error) => {
      logger.critical(e);
      setErr(e);
    },
    [setErr],
  );

  const handleReset = useCallback(() => {
    setErr(null);
    setStateStepId(steps[0].id);
    setNonce(curr => curr++);
  }, [setErr, setStateStepId, setNonce]);

  const handleStepChange = useCallback((step: Step) => {
    setStateStepId(step.id);
  }, []);

  const additionalProps = {
    ...props,
    onCloseModal: onClose,
    setError,
    firmware,
    error,
    deviceModelId,
  };

  return (
    <Modal
      width={550}
      onClose={onClose}
      centered
      onHide={handleReset}
      isOpened={status === "install"}
      refocusWhenChange={stateStepId}
      preventBackdropClick={!["finish", "resetDevice"].includes(stepId) && !error}
      render={() => (
        <Stepper
          key={nonce}
          onStepChange={handleStepChange}
          title={t("manager.firmware.update")}
          initialStepId={stepId}
          steps={steps}
          errorSteps={errorSteps}
          deviceModelId={deviceModelId}
          // $FlowFixMe fucking spread
          {...additionalProps}
        >
          <FreezeDeviceChangeEvents />
          <SyncSkipUnderPriority priority={100} />
        </Stepper>
      )}
    />
  );
};
export default UpdateModal;

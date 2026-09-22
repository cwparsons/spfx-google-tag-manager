import * as React from 'react';
import { Stack } from '@fluentui/react';
import {
  Button,
  Checkbox,
  CheckboxOnChangeData,
  Field,
  FluentProvider,
  Input,
  InputOnChangeData,
  MessageBar,
  MessageBarBody,
  Text,
  makeStyles,
  shorthands,
  tokens,
  webLightTheme
} from '@fluentui/react-components';

import { IGoogleTagManagerApplicationCustomizerProperties } from './IGoogleTagManagerApplicationCustomizerProperties';

export interface IPropertiesFormProps {
  initialProperties: IGoogleTagManagerApplicationCustomizerProperties;
  onSave: (properties: IGoogleTagManagerApplicationCustomizerProperties) => Promise<void>;
  onCancel: () => void;
  onReload: () => void;
}

type Status = 'idle' | 'saving' | 'saved';

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '420px',
    marginBlockStart: 0,
    maxWidth: 'calc(100vw - 32px)',
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalM,
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL)
  }
});

/**
 * Renders the container ID / user tracking form for the properties dialog. Only ever mounted
 * when the properties dialog is lazy loaded via the `spfx-google-tag-manager-properties`
 * query string, so pulling in Fluent UI here doesn't affect the customizer's normal page load.
 */
export const PropertiesForm: React.FunctionComponent<IPropertiesFormProps> = (props) => {
  const styles = useStyles();

  const [containerId, setContainerId] = React.useState(props.initialProperties.containerId);
  const [enableUserId, setEnableUserId] = React.useState(props.initialProperties.enableUserId);
  const [enableUserIdEncryption, setEnableUserIdEncryption] = React.useState(props.initialProperties.enableUserIdEncryption);
  const [containerIdError, setContainerIdError] = React.useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);
  const [status, setStatus] = React.useState<Status>('idle');

  const isBusy = status === 'saving';
  const isSaved = status === 'saved';

  const handleContainerIdChange = (_ev: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void => {
    setContainerId(data.value);
  };

  const handleEnableUserIdChange = (_ev: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData): void => {
    setEnableUserId(!!data.checked);
  };

  const handleEnableUserIdEncryptionChange = (_ev: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData): void => {
    setEnableUserIdEncryption(!!data.checked);
  };

  const handleSave = (): void => {
    const trimmedContainerId = containerId.trim();

    if (!trimmedContainerId) {
      setContainerIdError('A container ID is required.');
      return;
    }

    setContainerIdError(undefined);
    setErrorMessage(undefined);
    setStatus('saving');

    props
      .onSave({ containerId: trimmedContainerId, enableUserId, enableUserIdEncryption })
      .then(() => setStatus('saved'))
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setStatus('idle');
      });
  };

  return (
    <FluentProvider theme={webLightTheme} className={styles.root}>
      <Text as="h2" size={500} weight="semibold">
        Google Tag Manager settings
      </Text>

      <Field label="Container ID" required validationState={containerIdError ? 'error' : 'none'} validationMessage={containerIdError}>
        <Input value={containerId} placeholder="GTM-XXXXXXX" disabled={isBusy || isSaved} onChange={handleContainerIdChange} />
      </Field>

      <Checkbox
        label="Send the signed-in user's ID to the data layer"
        checked={enableUserId}
        disabled={isBusy || isSaved}
        onChange={handleEnableUserIdChange}
      />

      <Checkbox
        label="Hash the user ID before sending it"
        checked={enableUserIdEncryption}
        disabled={isBusy || isSaved || !enableUserId}
        onChange={handleEnableUserIdEncryptionChange}
      />

      {errorMessage && (
        <MessageBar intent="error">
          <MessageBarBody>{errorMessage}</MessageBarBody>
        </MessageBar>
      )}

      {isSaved && (
        <MessageBar intent="success">
          <MessageBarBody>Saved. Reload the page for the new settings to take effect.</MessageBarBody>
        </MessageBar>
      )}

      <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
        <Button appearance="secondary" disabled={isBusy} onClick={props.onCancel}>
          {isSaved ? 'Close' : 'Cancel'}
        </Button>
        <Button appearance="primary" disabled={isBusy} onClick={isSaved ? props.onReload : handleSave}>
          {isSaved ? 'Reload page' : isBusy ? 'Saving…' : 'Save'}
        </Button>
      </Stack>
    </FluentProvider>
  );
};

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import LoadingButton from '../LoadingButton';
import { styles } from './styles';
import type { WizardActionsProps } from './types';

// Keeps focus in the current field so its blur validation doesn't shift the layout mid-click.
const preventFieldBlur = (event: React.MouseEvent) => event.preventDefault();

const WizardActions = React.memo(
  ({
    isSubmitting,
    isNavigating,
    isFirstStep,
    isLastStep,
    next,
    back,
    cancel,
    submitText,
    submitting = false,
  }: WizardActionsProps) => {
    const busy = isNavigating || isSubmitting;

    return (
      <Box sx={styles.root}>
        {isFirstStep ? (
          cancel && (
            <Button
              type="button"
              variant="outlined"
              onMouseDown={preventFieldBlur}
              onClick={cancel}
              disabled={busy}
              sx={styles.button}
            >
              Cancel
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="outlined"
            onMouseDown={preventFieldBlur}
            onClick={back}
            disabled={busy}
            sx={styles.button}
          >
            Back
          </Button>
        )}
        <LoadingButton
          type={isLastStep ? 'submit' : 'button'}
          loading={busy || (isLastStep && submitting)}
          onClick={isLastStep ? undefined : next}
          variant="contained"
          sx={styles.button}
        >
          {isLastStep ? submitText : 'Next'}
        </LoadingButton>
      </Box>
    );
  },
);
export default WizardActions;

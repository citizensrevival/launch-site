import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LeadType } from '../lib/types';

export function useGetInvolvedDialog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const openDialog = useCallback((preselectedType?: LeadType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('dialog', 'get-involved');
    if (preselectedType) {
      newParams.set('type', preselectedType);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const closeDialog = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('dialog');
    newParams.delete('type');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const isDialogOpen = searchParams.get('dialog') === 'get-involved';
  const preselectedType = searchParams.get('type') as LeadType | null;

  return {
    openDialog,
    closeDialog,
    isDialogOpen,
    preselectedType
  };
}

import { useSourceServiceStore } from '@/entities/sourceService/model/stores.ts';
import { ref, watch } from 'vue';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import { SourceServiceTableType } from '@/entities/sourceService/model/types.ts';

export function useSourceServiceDetailModel() {
  const sourceServiceStore = useSourceServiceStore();
  const serviceId = ref<string | null>();
  const tableModel =
    useDefinitionTableModel<Record<SourceServiceTableType, any>>();

  function setServiceId(_serviceId: string | null) {
    serviceId.value = _serviceId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Source Service Name', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Description', name: 'description' },
      {
        label: 'Agent Status / Connection Status',
        name: 'status',
        disableCopy: true,
      },
    ];
  }

  function setDefineTableData(serviceId: string) {
    const sourceService = sourceServiceStore.getServiceById(serviceId);
    let data: Partial<Record<SourceServiceTableType, any>> = {};

    if (sourceService) {
      data = {
        name: sourceService.name,
        id: sourceService.id,
        description: sourceService.description,
        status: sourceService.status || '',
      };
    }
    return data;
  }

  function loadSourceServiceData(serviceId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (serviceId) {
      tableModel.tableState.data = setDefineTableData(serviceId);
    }
    tableModel.tableState.loading = false;
  }

  watch(serviceId, nv => {
    loadSourceServiceData(nv);
  });

  return {
    loadSourceServiceData,
    sourceServiceStore,
    initTable,
    tableModel,
    setServiceId,
  };
}

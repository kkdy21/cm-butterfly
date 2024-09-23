import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores.ts';
import { SourceConnectionTableTypes } from '@/entities/sourceConnection/model/types.ts';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import { ref, watch } from 'vue';

export function useSourceSoftwareCollectModel() {
  const sourceConnectionStore = useSourceConnectionStore();
  const defineTableModel =
    useDefinitionTableModel<Partial<Record<SourceConnectionTableTypes, any>>>();
  const connectionId = ref<string | null>(null);

  function setConnectionId(_connection: string | null) {
    connectionId.value = _connection;
  }

  function initTable() {
    defineTableModel.initState();
    defineTableModel.tableState.fields = [
      { label: 'Source Connection Name', name: 'name' },
      { label: 'Source Connection ID', name: 'id' },
      { label: 'Collect Status', name: 'collectStatus' },
      { label: 'Collect Datetime', name: 'collectDatetime' },
      { label: 'View SW', name: 'viewSW' },
    ];
  }

  function setDefineTableData(connectionId: string) {
    const connection = sourceConnectionStore.getConnectionById(connectionId);
    let data: Partial<Record<SourceConnectionTableTypes, any>> = {};

    if (connection) {
      data = {
        name: connection.name,
        id: connection.id,
        collectStatus: connection.collectStatus,
        collectDatetime: connection.collectDateTime,
        viewSW: connection.viewSW,
      };
    }

    return data;
  }

  watch(connectionId, nv => {
    defineTableModel.tableState.loading = true;
    if (nv) {
      defineTableModel.tableState.data = setDefineTableData(nv);
    }
    defineTableModel.tableState.loading = false;
  });

  return {
    sourceConnectionStore,
    setConnectionId,
    defineTableModel,
    initTable,
  };
}

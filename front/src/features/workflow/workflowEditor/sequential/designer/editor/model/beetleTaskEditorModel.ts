import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { ref, UnwrapRef } from 'vue';
import { isArray } from 'lodash';

interface fixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

type EntityContext = {
  type: 'entity';
  context: {
    subject: 'Entity';
    values: Array<InputContext | KeyValueInputContext>;
  };
};

type InputContext = {
  type: 'input';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<string>>;
  };
};

type KeyValueInputContext = {
  type: 'keyValueInput';
  context: {
    title: ReturnType<typeof useInputModel<string>>;
    model: ReturnType<typeof useInputModel<string>>;
  };
};

type AccordionSlotContext = {
  header: {
    icon: string;
    title: string; // index
  };
  content: Array<InputContext>;
};

type AccordionContext = {
  type: 'accordion';
  context: {
    subject: string;
    values: Array<AccordionSlotContext>;
  };
  index: number;
  originalData: Array<any>;
};

type QueryParamsModel = {
  type: 'params';
  context: {
    subject: 'Query_Params';
    values: Array<InputContext>;
  };
};

type PathParamsModel = {
  type: 'params';
  context: {
    subject: 'Path_Params';
    values: Array<InputContext>;
  };
};

type ConvertedData = EntityContext | AccordionContext;

export function useTaskEditorModel() {
  const formContext = ref<ConvertedData[]>([]);
  const paramsContext = ref<{
    path_params: PathParamsModel;
    query_params: QueryParamsModel;
  }>();

  function loadInputContext(
    key: string,
    value: string | '' | null,
  ): InputContext {
    return {
      type: 'input',
      context: {
        title: key,
        model: useInputModel(value ?? ''),
      },
    };
  }

  function loadKeyValueInputContext(): KeyValueInputContext {
    return {
      type: 'keyValueInput',
      context: {
        title: useInputModel(''),
        model: useInputModel(''),
      },
    };
  }

  function loadAccordionContext(
    object: object,
    index: number,
  ): AccordionSlotContext {
    return {
      header: {
        icon: 'ic_chevron-down',
        title: index.toString(),
      },
      content: Object.entries(object).map(
        ([key, value]: [key: string, value: string]) => {
          return loadInputContext(key, value);
        },
      ),
    };
  }

  function setParamsContext(fixedModel: fixedModel) {
    paramsContext.value = {
      path_params: {
        type: 'params',
        context: {
          subject: 'Path_Params',
          values: Object.entries(fixedModel.path_params).map(([key, value]) =>
            loadInputContext(key, value),
          ),
        },
      },
      query_params: {
        type: 'params',
        context: {
          subject: 'Query_Params',
          values: Object.entries(fixedModel.query_params).map(([key, value]) =>
            loadInputContext(key, value),
          ),
        },
      },
    };
  }

  function setFormContext(object: object | '') {
    const context: ConvertedData[] = [
      {
        type: 'entity',
        context: {
          subject: 'Entity',
          values: [],
        },
      },
    ];
    if (typeof object === 'object') {
      Object.entries(object).forEach(
        ([key, value]: [key: string, value: string | Array<object>], index) => {
          if (typeof value === 'string') {
            if (context[0].type === 'entity') {
              context[0].context.values.push(loadInputContext(key, value));
            }
          } else if (isArray(value)) {
            context.push({
              type: 'accordion',
              originalData: value,
              context: {
                subject: key,
                values: value.map((el, index) =>
                  loadAccordionContext(el, index),
                ),
              },
              index,
            });
          }
        },
      );
    }
    // @ts-ignore
    formContext.value = context;
  }

  function convertFormModelToStepProperties(): object {
    const properties = {};

    formContext.value.forEach(data => {
      if (data.type === 'entity') {
        const convertedObject = [];
        data.context.values.forEach(value => {
          if (value.type === 'keyValueInput') {
            if (
              value.context.title.value !== '' &&
              !entityKeyValidation(value.context.title)
            ) {
              //@ts-ignore
              convertedObject.push(getKeyValueInputData(value.context));
            }
          } else if (value.type === 'input') {
            //@ts-ignore
            convertedObject.push(getInputData(value.context));
          }
        });

        Object.assign(properties, ...convertedObject);
      } else if (data.type === 'accordion') {
        const accordionData = {
          [data.context.subject]: data.context.values.map(value =>
            // @ts-ignore
            getAccordionSlotData(value),
          ),
        };
        Object.assign(properties, accordionData);
      }
    });

    return properties;
  }

  function convertParamsModelToStepProperties() {
    const fixedModel: fixedModel = {
      path_params: {},
      query_params: {},
    };

    Object.assign(
      fixedModel.path_params,
      paramsContext.value?.path_params.context.values.reduce((acc, value) => {
        acc[value.context.title] = value.context.model.value;
        return acc;
      }, {}),
    );
    Object.assign(
      fixedModel.query_params,
      paramsContext.value?.query_params.context.values.reduce((acc, value) => {
        acc[value.context.title] = value.context.model.value;
        return acc;
      }, {}),
    );

    return fixedModel;
  }

  function getAccordionSlotData(accordionSlotContext: AccordionSlotContext) {
    const object = {};
    accordionSlotContext.content.forEach(data => {
      Object.assign(object, getInputData(data.context));
    });

    return object;
  }

  function getKeyValueInputData(object: KeyValueInputContext['context']) {
    return {
      // @ts-ignore
      [object.title.value]: object.model.value,
    };
  }

  function getInputData(inputContext: InputContext['context']) {
    return {
      [inputContext.title]: inputContext.model.value,
    };
  }

  function addEntity(
    target: UnwrapRef<Array<InputContext | KeyValueInputContext>>,
  ) {
    // @ts-ignore
    target.push(loadKeyValueInputContext());
  }

  function addArray(parentIndex: number) {
    if (formContext.value[parentIndex].type === 'accordion') {
      formContext.value[parentIndex].context.values.push(
        // @ts-ignore
        loadAccordionContext(formContext.value[parentIndex].originalData[0], 0),
      );
    }
  }

  //return 같은게 있으면 true 없으면 false
  function entityKeyValidation(
    model: UnwrapRef<ReturnType<typeof useInputModel<string>>>,
  ): boolean {
    if (formContext.value[0].type === 'entity') {
      const valid = formContext.value[0].context.values.some(value => {
        // @ts-ignore
        if (value.type === 'input') {
          // @ts-ignore
          return value.context.title === model.value;
        }
        return false;
      });
      model.isValid = !valid;
      return valid;
    }
    return false;
  }

  function deleteEntity(index: number) {
    if (formContext.value[0].type === 'entity') {
      formContext.value[0].context.values.splice(index, 1);
    }
  }

  function deleteArrayElement(
    targetArr:
      | UnwrapRef<Array<InputContext | KeyValueInputContext>>
      | UnwrapRef<Array<AccordionSlotContext>>,
    targetIndex: number,
  ) {
    targetArr.splice(targetIndex, 1);
  }

  return {
    formContext,
    paramsContext,
    setParamsContext,
    setFormContext,
    convertFormModelToStepProperties,
    convertParamsModelToStepProperties,
    addEntity,
    addArray,
    entityKeyValidation,
    deleteEntity,
    deleteArrayElement,
  };
}

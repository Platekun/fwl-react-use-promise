import useCleanup from '@future-widget-lab/react-use-cleanup';
import useValueUpdate from '@future-widget-lab/react-use-value-update';
import { useReducer } from 'react';

type IPromiseResult<TData = unknown> = [Error, null] | [null, TData];

type IPromiseDataType<T extends (...args: Array<any>) => Promise<IPromiseResult>> = Awaited<ReturnType<T>>[1];

interface IInvokeType<T extends (...args: Array<any>) => void> {
  (...args: Parameters<T>): void;
}

interface IPromiseState<TData = unknown> {
  status: 'idling' | 'pending' | 'fulfilled' | 'rejected' | 'cancelled';
  data: TData | null;
  error: Error | null;
}

type IPromiseEvent<TData = unknown> =
  | { type: 'INVOKED' }
  | { type: 'REJECTED'; error: Error }
  | { type: 'FULFILLED'; data: TData }
  | { type: 'RESET' }
  | { type: 'CANCELLED' };

type IDefaultVoidCallback = (...args: Array<any>) => void;

interface IUsePromiseOptions<TData = unknown, TInvoke extends IDefaultVoidCallback = IDefaultVoidCallback> {
  executor: Parameters<TInvoke>[0] extends undefined
    ? () => Promise<IPromiseResult<TData>>
    : (args: Parameters<TInvoke>[0]) => Promise<IPromiseResult<TData>>;
  onFulfilled?: (data: TData) => void;
  onRejected?: (error: Error) => void;
}

type IPromise<
  TData = unknown,
  TInvoke extends IDefaultVoidCallback = IDefaultVoidCallback
> = (Parameters<TInvoke>[0] extends undefined
  ? {
      invoke: () => Promise<void>;
      invokeWith: (invokeOptions: {
        args?: undefined;
        onFulfilled?: (data: TData) => void;
        onRejected?: (error: Error) => void;
      }) => Promise<void>;
      reset: VoidFunction;
    }
  : {
      invoke: (args: Parameters<TInvoke>[0]) => Promise<void>;
      invokeWith: (invokeOptions: {
        args: Parameters<TInvoke>[0];
        onFulfilled?: (data: TData) => void;
        onRejected?: (error: Error) => void;
      }) => Promise<void>;
      reset: VoidFunction;
    }) &
  (
    | { isIdling: true; isPending: false; isRejected: false; isFulfilled: false; data: null; error: null }
    | { isIdling: false; isPending: true; isRejected: false; isFulfilled: false; data: null; error: null }
    | { isIdling: false; isPending: false; isRejected: true; isFulfilled: false; data: null; error: Error }
    | { isIdling: false; isPending: false; isRejected: false; isFulfilled: true; data: TData; error: null }
  );

function usePromise<TData extends unknown, TInvoke extends IDefaultVoidCallback = IDefaultVoidCallback>(
  options: IUsePromiseOptions<TData, TInvoke>
): IPromise<TData, TInvoke> {
  const [state, send] = useReducer(
    function reducer(state: IPromiseState<TData>, event: IPromiseEvent<TData>): IPromiseState<TData> {
      switch (event.type) {
        case 'CANCELLED': {
          return {
            ...state,
            status: 'cancelled',
          };
        }

        case 'INVOKED': {
          if (state.status === 'pending') {
            return state;
          }

          return {
            ...state,
            status: 'pending',
            error: null,
          };
        }

        case 'REJECTED': {
          if (state.status !== 'pending') {
            return state;
          }

          return {
            ...state,
            status: 'rejected',
            error: event.error,
          };
        }

        case 'FULFILLED': {
          if (state.status !== 'pending') {
            return state;
          }

          return {
            ...state,
            status: 'fulfilled',
            data: event.data,
          };
        }

        case 'RESET': {
          if (state.status !== 'fulfilled') {
            return state;
          }

          return {
            status: 'idling',
            data: null,
            error: null,
          };
        }

        default:
          return state;
      }
    },
    {
      status: 'idling',
      data: null,
      error: null,
    }
  );

  useCleanup(() => {
    send({ type: 'CANCELLED' });
  });

  const invoke: IPromise<TData, TInvoke>['invoke'] = async (args) => {
    send({ type: 'INVOKED' });

    const result = (await options.executor(args)) as IPromiseResult<TData>;

    if (state.status === 'cancelled') {
      return;
    }

    if (result[0] !== null) {
      send({ type: 'REJECTED', error: result[0] });
    } else {
      send({ type: 'FULFILLED', data: result[1] });
    }
  };

  // @ts-ignore
  const invokeWith: IPromise<TData, TInvoke>['invokeWith'] = async (invokeOptions) => {
    send({ type: 'INVOKED' });

    const result = (await options.executor(invokeOptions.args)) as IPromiseResult<TData>;

    if (state.status === 'cancelled') {
      return;
    }

    if (result[0] !== null) {
      send({ type: 'REJECTED', error: result[0] });

      if (invokeOptions.onRejected) {
        invokeOptions.onRejected(result[0]);
      }
    } else {
      send({ type: 'FULFILLED', data: result[1] });

      if (invokeOptions.onFulfilled) {
        invokeOptions.onFulfilled(result[1]);
      }
    }
  };

  const isFulfilled = state.status === 'fulfilled';

  useValueUpdate({
    value: isFulfilled,
    sideEffect: () => {
      if (state.status === 'fulfilled' && options.onFulfilled) {
        options.onFulfilled(state.data as TData);
      }
    },
  });

  const isRejected = state.status === 'rejected';

  useValueUpdate({
    value: isRejected,
    sideEffect: () => {
      if (state.status === 'rejected' && options.onRejected) {
        options.onRejected(state.error as Error);
      }
    },
  });

  const isIdling = state.status === 'idling';
  const isPending = state.status === 'pending';

  const reset = () => {
    send({ type: 'RESET' });
  };

  // @ts-ignore
  return {
    isIdling,
    isPending,
    isRejected,
    isFulfilled,
    invoke,
    invokeWith,
    reset,
    data: state.data,
    error: state.error,
  };
}

export default usePromise;
export { IInvokeType, IPromise, IPromiseResult, IPromiseDataType, IUsePromiseOptions };

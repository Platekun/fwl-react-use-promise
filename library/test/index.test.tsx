// 💡 https://jestjs.io/docs/api
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import usePromise, { IInvokeType } from '../source';

afterEach(cleanup);

type IUserFetcher = () => Promise<[Error, null] | [null, { user: string }]>;

const Form: React.FC<{
  executor: IUserFetcher;
  onFulfilled: (response: { user: string }) => void;
  onRejected: (error: Error) => void;
}> = (props) => {
  const promise = usePromise<{ user: string }, IInvokeType<IUserFetcher>>({
    executor: props.executor,
    onFulfilled: props.onFulfilled,
    onRejected: props.onRejected,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        promise.invoke();
      }}
    >
      {promise.isIdling && <p>Idling</p>}
      {promise.isPending && <p>Pending</p>}
      {promise.isRejected && <p data-error={(promise.error as Error).message}>isRejected</p>}
      {promise.isFulfilled && <p data-data={JSON.stringify(promise.data)}>isFulfilled</p>}
      <button>Submit</button>
      <button
        type="button"
        onClick={() => {
          promise.reset();
        }}
      >
        Reset
      </button>
    </form>
  );
};

type IUserFetcherWithArgs = (data: { user: string }) => Promise<[Error, null] | [null, { user: string }]>;

const FormUsingInvokeWithArgs: React.FC<{
  executor: IUserFetcherWithArgs;
  onFulfilled: (response: { user: string }) => void;
  onRejected: (error: Error) => void;
}> = (props) => {
  const promise = usePromise<{ user: string }, IInvokeType<IUserFetcherWithArgs>>({
    executor: props.executor,
    onFulfilled: props.onFulfilled,
    onRejected: props.onRejected,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        promise.invoke({
          user: 'Jakob',
        });
      }}
    >
      {promise.isIdling && <p>Idling</p>}
      {promise.isPending && <p>Pending</p>}
      {promise.isRejected && <p data-error={(promise.error as Error).message}>isRejected</p>}
      {promise.isFulfilled && <p data-data={JSON.stringify(promise.data)}>isFulfilled</p>}
      <button>Submit</button>
      <button
        type="button"
        onClick={() => {
          promise.reset();
        }}
      >
        Reset
      </button>
    </form>
  );
};

const FormUsingInvokeWithWithArgs: React.FC<{
  executor: IUserFetcherWithArgs;
  onFulfilled: (response: { user: string }) => void;
  onRejected: (error: Error) => void;
}> = (props) => {
  const promise = usePromise<{ user: string }, IInvokeType<IUserFetcherWithArgs>>({
    executor: props.executor,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        promise.invokeWith({
          args: {
            user: 'Jakob',
          },
          onFulfilled: props.onFulfilled,
          onRejected: props.onRejected,
        });
      }}
    >
      {promise.isIdling && <p>Idling</p>}
      {promise.isPending && <p>Pending</p>}
      {promise.isRejected && <p data-error={(promise.error as Error).message}>isRejected</p>}
      {promise.isFulfilled && <p data-data={JSON.stringify(promise.data)}>isFulfilled</p>}
      <button>Submit</button>
      <button
        type="button"
        onClick={() => {
          promise.reset();
        }}
      >
        Reset
      </button>
    </form>
  );
};

const FormUsingInvokeWithButNoArgs: React.FC<{
  executor: IUserFetcher;
  onFulfilled: (response: { user: string }) => void;
  onRejected: (error: Error) => void;
}> = (props) => {
  const promise = usePromise<{ user: string }, IInvokeType<IUserFetcher>>({
    executor: props.executor,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        promise.invokeWith({
          onFulfilled: props.onFulfilled,
          onRejected: props.onRejected,
        });
      }}
    >
      {promise.isIdling && <p>Idling</p>}
      {promise.isPending && <p>Pending</p>}
      {promise.isRejected && <p data-error={(promise.error as Error).message}>isRejected</p>}
      {promise.isFulfilled && <p data-data={JSON.stringify(promise.data)}>isFulfilled</p>}
      <button>Submit</button>
      <button
        type="button"
        onClick={() => {
          promise.reset();
        }}
      >
        Reset
      </button>
    </form>
  );
};

describe('usePromise', () => {
  it('should exist.', () => {
    expect(usePromise).not.toBeUndefined();
  });

  it('Idling -> Pending -> Fulfilled (using invoke with no args).', async () => {
    const data = {
      user: 'Jakob',
    };

    const executor: IUserFetcher = async () => {
      return [null, data];
    };
    const onFulfilled = jest.fn().mockImplementation((onFulfilledData) => {
      expect(onFulfilledData).toMatchObject(data);
      expect(onFulfilled).toHaveBeenCalledTimes(1);
    });
    const onRejected = jest.fn();

    const { findByText } = render(<Form executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />);

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Fulfilled/i));
    expect(onRejected).toHaveBeenCalledTimes(0);
    expect((await findByText(/Fulfilled/i)).getAttribute('data-data')).toEqual(JSON.stringify(data));
  });

  it('Idling -> Pending -> Fulfilled (using invoke with args).', async () => {
    const executor: IUserFetcherWithArgs = async (data) => {
      return [null, data] as [null, { user: string }];
    };
    const onFulfilled = jest.fn().mockImplementation((onFulfilledData) => {
      expect(onFulfilledData).toMatchObject({ user: 'Jakob' });
      expect(onFulfilled).toHaveBeenCalledTimes(1);
    });
    const onRejected = jest.fn();

    const { findByText } = render(
      <FormUsingInvokeWithArgs executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />
    );

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Fulfilled/i));
    expect(onRejected).toHaveBeenCalledTimes(0);
    expect((await findByText(/Fulfilled/i)).getAttribute('data-data')).toEqual(JSON.stringify({ user: 'Jakob' }));
  });

  it('Idling -> Pending -> Fulfilled (using invokeWith with args).', async () => {
    const executor: IUserFetcherWithArgs = async (data) => {
      return [null, data] as [null, { user: string }];
    };
    const onFulfilled = jest.fn().mockImplementation((onFulfilledData) => {
      expect(onFulfilledData).toMatchObject({ user: 'Jakob' });
      expect(onFulfilled).toHaveBeenCalledTimes(1);
    });
    const onRejected = jest.fn();

    const { findByText } = render(
      <FormUsingInvokeWithWithArgs executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />
    );

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Fulfilled/i));
    expect(onRejected).toHaveBeenCalledTimes(0);
    expect((await findByText(/Fulfilled/i)).getAttribute('data-data')).toEqual(JSON.stringify({ user: 'Jakob' }));
  });

  it('Idling -> Pending -> Fulfilled -> Idling (using invoke with no args).', async () => {
    const data = {
      user: 'Jakob',
    };

    const executor: IUserFetcher = async () => {
      return [null, data];
    };
    const onFulfilled = jest.fn().mockImplementation((onFulfilledData) => {
      expect(onFulfilledData).toMatchObject(data);
      expect(onFulfilled).toHaveBeenCalledTimes(1);
    });
    const onRejected = jest.fn();

    const { findByText } = render(<Form executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />);

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Fulfilled/i));
    expect(onRejected).toHaveBeenCalledTimes(0);
    expect((await findByText(/Fulfilled/i)).getAttribute('data-data')).toEqual(JSON.stringify(data));

    fireEvent.click(await findByText(/Reset/i));
    expect(await findByText(/Idling/i));
  });

  it('Idling -> Pending -> Fulfilled (using invokeWith with no args).', async () => {
    const data = {
      user: 'Jakob',
    };

    const executor: IUserFetcher = async () => {
      return [null, data];
    };
    const onFulfilled = jest.fn().mockImplementation((onFulfilledData) => {
      expect(onFulfilledData).toMatchObject(data);
      expect(onFulfilled).toHaveBeenCalledTimes(1);
    });
    const onRejected = jest.fn();

    const { findByText } = render(
      <FormUsingInvokeWithButNoArgs executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />
    );

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Fulfilled/i));
    expect(onRejected).toHaveBeenCalledTimes(0);
    expect((await findByText(/Fulfilled/i)).getAttribute('data-data')).toEqual(JSON.stringify({ user: 'Jakob' }));
  });

  it('Idling -> Pending -> Rejected (using invoke with no args).', async () => {
    const error = new Error('Invalid credentials');

    const executor: IUserFetcher = async () => {
      return [error, null];
    };
    const onFulfilled = jest.fn();
    const onRejected = jest.fn().mockImplementation((onRejectedData) => {
      expect(onRejectedData).toEqual(error);
      expect(onRejected).toHaveBeenCalledTimes(1);
    });

    const { findByText } = render(<Form executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />);

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Rejected/i));
    expect(onFulfilled).toHaveBeenCalledTimes(0);
    expect((await findByText(/Rejected/i)).getAttribute('data-error')).toEqual('Invalid credentials');
  });

  it('Idling -> Pending -> Rejected (using invokeWith with no args).', async () => {
    const error = new Error('Invalid credentials');

    const executor: IUserFetcher = async () => {
      return [error, null];
    };
    const onFulfilled = jest.fn();
    const onRejected = jest.fn().mockImplementation((onRejectedData) => {
      expect(onRejectedData).toEqual(error);
      expect(onRejected).toHaveBeenCalledTimes(1);
    });

    const { findByText } = render(
      <FormUsingInvokeWithButNoArgs executor={executor} onFulfilled={onFulfilled} onRejected={onRejected} />
    );

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Idling/i));

    fireEvent.click(await findByText(/Submit/i));

    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
    expect(await findByText(/Pending/i));

    await waitFor(async () => await findByText(/Rejected/i));
    expect(onFulfilled).toHaveBeenCalledTimes(0);
    expect((await findByText(/Rejected/i)).getAttribute('data-error')).toEqual('Invalid credentials');
  });
});

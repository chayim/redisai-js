/**
 * Statistics about model/script types
 */
import { Backend, BackendMap } from './backend';

export class Stats {
  /**
   *
   * @param key - a String of the name of the key storing the model or script value
   * @param type - a String of the type of value (i.e. 'MODEL' or 'SCRIPT')
   * @param backend -  a String of the type of backend (always 'TORCH' for 'SCRIPT' value type)
   * @param device - the device that will execute the model. can be of CPU or GPU
   */
  constructor(key: string, type: string, backend: Backend, device: string) {
    this._key = key;
    this._type = type;
    this._backend = backend;
    this._device = device;
    this._duration = 0;
    this._samples = 0;
    this._calls = 0;
    this._errors = 0;
    this._tag = undefined;
  }

  // a String of the device where execution took place
  private _device: string;

  get device(): string {
    return this._device;
  }

  set device(value: string) {
    this._device = value;
  }

  // the cumulative duration of executions in microseconds
  private _duration: number;

  get duration(): number {
    return this._duration;
  }

  set duration(value: number) {
    this._duration = value;
  }

  // the cumulative number of samples obtained from the 0th (batch) dimension (only applicable for RedisAI models)
  private _samples: number;

  get samples(): number {
    return this._samples;
  }

  set samples(value: number) {
    this._samples = value;
  }

  // the total number of executions
  private _calls: number;

  get calls(): number {
    return this._calls;
  }

  set calls(value: number) {
    this._calls = value;
  }

  //  the total number of errors generated by executions (excluding any errors generated during parsing commands)
  private _errors: number;

  get errors(): number {
    return this._errors;
  }

  set errors(value: number) {
    this._errors = value;
  }

  private _key: string;

  get key(): string {
    return this._key;
  }

  set key(value: string) {
    this._key = value;
  }

  private _type: string;

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  private _backend: Backend;

  get backend(): Backend {
    return this._backend;
  }

  set backend(value: Backend) {
    this._backend = value;
  }

  // tag is an optional string for tagging the model/script such as a version number or any arbitrary identifier
  private _tag: string | undefined;

  get tag(): string | undefined {
    return this._tag;
  }

  /**
   * sets an optional string for tagging the model/scrit such as a version number or any arbitrary identifier
   * @param value
   */
  set tag(value: string | undefined) {
    this._tag = value;
  }

  static NewStatsFromInfoReply(reply: any[]) {
    let keystr: string | null = null;
    let type: string | null = null;
    let backend: Backend | null = null;
    let device: string | null = null;
    let tag: string | null = null;
    let duration: number | null = null;
    let samples: number | null = null;
    let calls: number | null = null;
    let errors: number | null = null;
    for (let i = 0; i < reply.length; i += 2) {
      const key = reply[i];
      const obj = reply[i + 1];
      switch (key.toString()) {
        case 'key':
          keystr = obj.toString();
          break;
        case 'type':
          type = obj.toString();
          break;
        case 'backend':
          // @ts-ignore
          backend = BackendMap[obj.toString()];
          break;
        case 'device':
          // @ts-ignore
          device = obj.toString();
          break;
        case 'tag':
          tag = obj.toString();
          break;
        case 'duration':
          duration = obj;
          break;
        case 'samples':
          samples = obj;
          break;
        case 'calls':
          calls = obj;
          break;
        case 'errors':
          errors = obj;
          break;
      }
    }
    if (keystr == null || type == null || backend == null || device == null) {
      const missingArr = [];
      if (keystr == null) {
        missingArr.push('key');
      }
      if (type == null) {
        missingArr.push('type');
      }
      if (backend == null) {
        missingArr.push('backend');
      }
      if (device == null) {
        missingArr.push('device');
      }
      throw Error(
        'AI.INFO reply did not had the full elements to build the Stats. Missing ' + missingArr.join(',') + '.',
      );
    }
    const stat = new Stats(keystr, type, backend, device);
    if (tag !== null) {
      stat.tag = tag;
    }
    if (duration !== null) {
      stat.duration = duration;
    }
    if (samples !== null) {
      stat.samples = samples;
    }
    if (calls !== null) {
      stat.calls = calls;
    }
    if (errors !== null) {
      stat.errors = errors;
    }
    return stat;
  }
}

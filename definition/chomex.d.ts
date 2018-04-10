declare module chomex {
    class Router {
        on(action: string, handler: (message: any) => any): any
        listener(): any
    }
    class Client {
        constructor(mod: any, strict?: boolean)
        message(action: string, message?: any): Promise<any>;
    }
    class Model {
        static create<T>(props: Object): T;
        static list<T>(): T[];
        static drop(): void;
    }
}

export = chomex;
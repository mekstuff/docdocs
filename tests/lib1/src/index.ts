/**
 * This is class 1
 */
export class ClassOne {
	/**
	 * Some docs about ClassOne.OneProperty
	 */
	OneProperty: string | number = "Hello World";
	constructor(Loop: string | number) {}
}

// export class ClassTwo extends ClassOne {}

export function FuncOne(Arg0: number, Arg1: string, Arg2: number | string, Arg3?: unknown): string | number | unknown {
	return 1;
}

export function FuncTwo<T extends string>(Arg0: T): Promise<T> {
	return new Promise(() => {});
}

export interface InterfaceOne {
	InterfaceOneProp0: string | number;
	InterfaceOneProp1: boolean;
}

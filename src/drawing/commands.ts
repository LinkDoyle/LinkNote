export interface Point {
  x: number;
  y: number;
}

const createCommand = <P = void, T extends string = string>(type: T) => (
  payload: P
): {
  type: T;
  payload: P;
} => ({
  type,
  payload,
});

const commands = {
  cmdPen: createCommand<
    { lineWidth: number; color: string; tracks: Point[] },
    "PEN"
  >("PEN"),
  cmdClear: createCommand("CLEAR"),
};

export const { cmdPen, cmdClear } = commands;

export type Command = ReturnType<typeof commands[keyof typeof commands]>;

export type CommandType = ReturnType<
  typeof commands[keyof typeof commands]
>["type"];

export type ExtractPayload<T> = Extract<
  ReturnType<typeof commands[keyof typeof commands]>,
  { type: T }
>["payload"];

export type CommandPayload = ExtractPayload<CommandType>;

export type IDrawer = {
  [T in CommandType]: ExtractPayload<T> extends void
    ? () => void
    : (payload: ExtractPayload<T>) => void;
} & { execute: (command: Command) => void };

import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import "./App.css";

interface TPromiseGod {
  makePromise(id: string): void;
  getPromise(id: string): Promise<any>;
  resolve(id: string): void;
  isResolve(id: string): boolean;
}

class PromiseGod implements TPromiseGod {
  private promiseMap: Map<string, Promise<any>> = new Map();
  private resolveFnMap: Map<string, () => void> = new Map();
  private resolvedSet: Set<string> = new Set();

  public makePromise(id: string): void {
    if (this.promiseMap.has(id)) {
      throw new Error(`${id} is already taken`);
    }
    this.promiseMap.set(
      id,
      new Promise((resolve) => {
        this.resolveFnMap.set(id, () => resolve(0));
      }),
    );
  }

  public getPromise(id: string): Promise<any> {
    const p = this.promiseMap.get(id);
    if (!p) {
      throw new Error(`${id} is not promised`);
    }
    return p;
  }

  public resolve(id: string): void {
    const resolveFn = this.resolveFnMap.get(id);
    if (!resolveFn) {
      throw new Error(`${id} is not promised`);
    }
    this.resolvedSet.add(id);
    resolveFn();
  }

  public isResolve(id: string): boolean {
    return this.resolvedSet.has(id);
  }
}

const promiseGod: TPromiseGod = new PromiseGod();

function Suspendable(props: { children: ReactNode; promiseId: string }) {
  if (!promiseGod.isResolve(props.promiseId)) {
    throw promiseGod.getPromise(props.promiseId);
  }
  return props.children;
}

function RevealAfterCommit(props: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(true);
  }, []);

  if (!revealed) return null;
  return props.children;
}

promiseGod.makePromise("foo");
promiseGod.makePromise("bar");

export default function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Timer />

      <div style={{ display: "flex", gap: "16px" }}>
        <button onClick={() => promiseGod.resolve("foo")}>resolve foo</button>
        <button onClick={() => promiseGod.resolve("bar")}>resolve bar</button>
      </div>

      <Foo />
    </div>
  );
}

function Foo() {
  console.log("render foo");
  const n = useMemo(() => {
    console.log("foo fib(40)");
    return fib(40);
  }, []);

  return (
    <RevealAfterCommit>
      <Suspense fallback="foo loading...">
        <Suspendable promiseId="foo">
          <div>
            <h1>Foo</h1>
            <p>{n}</p>
            <Bar />
          </div>
        </Suspendable>
      </Suspense>
    </RevealAfterCommit>
  );
}

function Bar() {
  console.log("render bar");
  const n = useMemo(() => {
    console.log("bar fib(40)");
    return fib(40);
  }, []);

  return (
    <RevealAfterCommit>
      <Suspense fallback="bar loading...">
        <Suspendable promiseId="bar">
          <h2>Bar</h2>
          <p>{n}</p>
        </Suspendable>
      </Suspense>
    </RevealAfterCommit>
  );
}

function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 2) + fib(n - 1);
}

function Timer() {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const n = fib(28);
      console.log("timer fib(28)", n);
      setTime(Date.now());
    }, 5);

    return () => {
      clearInterval(id);
    };
  }, []);

  return <div>timestamp: {time}</div>;
}

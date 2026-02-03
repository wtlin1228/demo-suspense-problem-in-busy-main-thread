This occurs when the main thread is busy, but not maxed out.

![multiple bar fib](./multiple-bar-fib.png)

![performance record](./performance-record.png)

# Solutions

## Use `useEffect` for heavy work

```diff
function Bar() {
  console.log("render bar");

- const n = useMemo(() => {
-   console.log("bar fib(40)");
-   return fib(40);
- }, []);
+ const [n, setN] = useState(0);
+ useEffect(() => {
+   console.log("bar fib(40)");
+   setN(fib(40));
+ }, []);

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
```

## Reveal the `children` after commit

```diff
function Suspendable(props: { children: ReactNode; promiseId: string }) {
  if (!promiseGod.isResolve(props.promiseId)) {
    throw promiseGod.getPromise(props.promiseId);
  }
- return props.children;
+ return <RevealAfterCommit>{props.children}</RevealAfterCommit>;
}
```

```ts
function RevealAfterCommit(props: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(true);
  }, []);

  if (!revealed) return null;
  return props.children;
}
```

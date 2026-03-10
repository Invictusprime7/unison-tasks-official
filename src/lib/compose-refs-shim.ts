/**
 * React 19-compatible shim for @radix-ui/react-compose-refs
 * 
 * React 19 changed ref callback semantics: ref callbacks can now return
 * a cleanup function. The original Radix package doesn't account for this,
 * causing infinite re-render loops when the cleanup function is mistakenly
 * treated as a ref value update.
 */
import * as React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    // In React 19, calling a ref callback may return a cleanup function.
    // We must NOT feed that cleanup back as a value — just ignore the return.
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // Filter out null/undefined refs once
  const filtered = refs.filter(Boolean) as NonNullable<PossibleRef<T>>[];
  if (filtered.length === 0) return () => {};
  if (filtered.length === 1) {
    const single = filtered[0];
    return (node: T) => setRef(single, node);
  }
  return (node: T) => {
    filtered.forEach((ref) => setRef(ref, node));
  };
}

function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // Stringify refs identity to avoid dependency-array churn from new array objects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };

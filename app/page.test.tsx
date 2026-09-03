import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import Home from "./page";
import { Sidebar } from "@/components/layout/sidebar";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function countElementsOfType(node: React.ReactNode, target: React.ElementType): number {
  if (!React.isValidElement(node)) {
    return 0;
  }

  const element = node as React.ReactElement<{ children?: React.ReactNode }>;
  const ownCount = element.type === target ? 1 : 0;
  const childCount = React.Children.toArray(element.props.children).reduce<number>(
    (count, child) => count + countElementsOfType(child, target),
    0,
  );

  return ownCount + childCount;
}

test("Home does not render a duplicate Sidebar", async () => {
  const homeElement = await Home();
  assert.equal(countElementsOfType(homeElement, Sidebar), 0);
});

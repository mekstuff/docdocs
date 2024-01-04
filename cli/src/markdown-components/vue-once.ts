/**
 * A vue component that is rendered only once.
 *
  Markdown Components
 */
export function vueonce(body: string): string {
  return `<template v-once>${body}</template>`;
}

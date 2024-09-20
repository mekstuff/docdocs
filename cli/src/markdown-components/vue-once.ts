export function vueonce(body: string): string {
  return `<template v-once>${body}</template>`;
}

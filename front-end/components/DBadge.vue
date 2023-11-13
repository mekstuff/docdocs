<script setup lang="ts">
interface Props {
  text?: string;
  emoji?: string;
  color?: string;
}

function hashCode(str) {
  // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();

  return "#" + "00000".substring(0, 6 - c.length) + c;
}

const PreDeterminedBadgeColors: Record<string, string> = {
  readonly: `#ff0054`,
  private: `#ee6c4d`,
  secured: `#6b9080`,
  server: `#a7c957`,
  client: `#4cc9f0`,
  async: `#cdb4db`,
  yields: `#f48c06`,
  deprecated: `#d90429`,
  const: `#ff0054`,
};
function getBadgeColor(str: string | undefined) {
  str = str ?? "...";
  return PreDeterminedBadgeColors[str] ?? intToRGB(hashCode(str));
}

withDefaults(defineProps<Props>(), {});
</script>

<template>
  <span class="DBadge">
    <slot> {{ emoji }} {{ text }}</slot>
  </span>
</template>

<style scoped>
.DBadge {
  display: inline-block;
  margin-left: 2px;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0 10px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
  transform: translateY(-2px);
  background-color: v-bind(getBadgeColor(text));
}
</style>

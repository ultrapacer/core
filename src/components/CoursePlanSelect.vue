<template>
  <b-dropdown
    right
    variant="primary"
    class="plan-select-dropdown"
  >
    <template #button-content>
      <div class="plan-select-dropdown-button-div">
        <div style="text-overflow: ellipsis; overflow: hidden; width:100%; text-align: left">
          <span class="d-none d-sm-inline">Plan: </span>{{ plan.name }}
        </div>
      </div>
    </template>
    <b-dropdown-text v-if="plans.length && plansByOthers.length">
      Plans by me:
    </b-dropdown-text>
    <b-dropdown-item
      v-for="p in plans"
      :key="p._id"
      class="plan-select-dropdown-list-item"
      :variant="plan && plan._id===p._id ? 'primary' : ''"
      @click="$emit('select', p)"
    >
      <div
        class="plan-select-dropdown-list-item"
        :style="plan && plan._id===p._id ? 'font-weight:bold' : ''"
      >
        {{ p.name }}
      </div>
    </b-dropdown-item>
    <b-dropdown-divider v-if="plans.length" />
    <b-dropdown-text v-if="plansByOthers.length">
      Plans by others:
    </b-dropdown-text>
    <b-dropdown-item
      v-for="p in plansByOthers"
      :key="p._id"
      class="plan-select-dropdown-list-item"
      :variant="plan && plan._id===p._id ? 'primary' : ''"
      @click="$emit('select', p)"
    >
      <div
        class="plan-select-dropdown-list-item"
        :style="plan && plan._id===p._id ? 'font-weight:bold' : ''"
      >
        {{ p.name }}
      </div>
    </b-dropdown-item>
    <b-dropdown-divider v-if="plansByOthers.length" />
    <b-dropdown-item
      @click="$emit('new')"
    >
      <v-icon name="plus" />  New Plan
    </b-dropdown-item>
  </b-dropdown>
</template>
<script>
export default {
  props: {
    plan: { type: Object, required: true },
    plans: { type: Array, required: true },
    plansByOthers: { type: Array, required: true }
  }
}
</script>
<style>
.plan-select-dropdown-list-item {
  max-width: calc(100vw - 20px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.plan-select-dropdown button {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  padding-right: 16px;
  padding-left: 6px;
}
.plan-select-dropdown-button-div {
  display: inline-flex;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left:0;
  width:100%
}
</style>

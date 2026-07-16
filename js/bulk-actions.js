export function createTaskSelection() {
  let active = false;
  const selectedIds = new Set();

  return {
    enter() {
      active = true;
    },
    exit() {
      active = false;
      selectedIds.clear();
    },
    isActive() {
      return active;
    },
    isSelected(id) {
      return selectedIds.has(String(id));
    },
    toggle(id) {
      const key = String(id);
      if (selectedIds.has(key)) selectedIds.delete(key);
      else selectedIds.add(key);
      return selectedIds.has(key);
    },
    selectVisible(ids) {
      ids.forEach((id) => selectedIds.add(String(id)));
    },
    clear() {
      selectedIds.clear();
    },
    prune(validIds) {
      const valid = validIds instanceof Set ? validIds : new Set(validIds.map(String));
      selectedIds.forEach((id) => {
        if (!valid.has(id)) selectedIds.delete(id);
      });
    },
    getIds() {
      return [...selectedIds];
    },
    getCount() {
      return selectedIds.size;
    }
  };
}

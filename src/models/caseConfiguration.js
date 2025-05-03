export const CASE_CONFIG = {
    ITEM_WIDTH: 100,
    ITEM_MARGIN: 5,
    VISIBLE_ITEMS: 7,
    TOTAL_ITEMS: 30,
    ANIMATION_DURATION: 3,
    DESCRIPTION_DELAY: 3000,
    get REWARD_INDEX() {
      return this.TOTAL_ITEMS - 1 - Math.ceil(this.VISIBLE_ITEMS/2)
    },
    get CONTAINER_WIDTH() {
      return (this.ITEM_WIDTH + 10) * this.VISIBLE_ITEMS
    }
};
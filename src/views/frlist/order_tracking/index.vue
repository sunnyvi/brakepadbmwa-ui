<template>
  <i-frame :src="url" />
</template>
<script>
import iFrame from "@/components/iFrame/index";
export default {
  // name: "Order Tracking",
  components: { iFrame },
  data() {
    return {
      url: "http://10.10.10.97:8080/webroot/ReportServer?reportlet=bmwa/report/sales/pad_order_tracking.cpt"
    };
  },
};
</script>

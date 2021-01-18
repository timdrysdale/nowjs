import { mapState } from "vuex";
import axios from "axios";
import dayjs from "dayjs";
import $ from "jquery";
export default {
  props: ["description", "key", "index"],
  components: {},
  computed: {
    title: function () {
      return this.description.name;
    },
    image: function () {
      return this.description.image;
    },
    what: function () {
      return this.description.short;
    },
    about: function () {
      return this.description.long;
    },
    status: function () {
      return "Until " + dayjs.unix(this.description.exp).format("h:mm A");
    },
    ...mapState({
      bookingTokenValid: (state) => state.bookingTokenValid,
      bookingToken: (state) => state.bookingToken,
      poolStatus: (state) => state.poolStatus,
      details: (state) => state.poolDescriptions,
      ids: (state) => state.poolIDs,
    }),
  },
  methods: {
    request(val) {
      console.log("requested booking of ", val);

      var id = this.description.id;
      var duration = val * 60; //seconds
      console.log(this.bookingToken);
      axios
        .post(
          "http://[::]:4000/api/v1/pools/" +
            id +
            "/sessions?duration=" +
            duration,
          {},
          {
            headers: {
              Authorization: this.bookingToken,
            },
          }
        )
        .then(
          (response) => {
            this.$store.commit("addActivityBooking", {
              id: id,
              status: response.data,
              ok: true,
            });
          },
          (error) => {
            console.log(error.response.data);
          }
        );
      this.getStatus();
    },
    getStatus() {
      var id = this.description.id;

      axios
        .get("http://[::]:4000/api/v1/pools/" + id + "/status", {
          headers: {
            Authorization: this.bookingToken,
          },
        })
        .then(
          (response) => {
            this.$store.commit("setPoolStatus", {
              id: id,
              status: response.data,
              ok: true,
            });
          },
          (error) => {
            this.$store.commit("setPoolStatus", {
              id: id,
              status: {},
              ok: false,
            });
          }
        );
    },
  },
  created() {
    this.getStatus();
  },
};

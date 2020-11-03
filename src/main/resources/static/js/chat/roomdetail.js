// websocket & stomp initialize
var sock = new SockJS("/ws-stomp");
var ws = Stomp.over(sock);

// vue.js
var vm = new Vue({
    el: '#app',
    data: {
        roomId: '',
        room: {},
        writer: '',
        message: '',
        messages: []
    },
    created() {
        this.roomId = localStorage.getItem('wschat.roomId');
        this.writer = localStorage.getItem('wschat.writer');
        this.findRoom();
    },
    methods: {
        findRoom: function () {
            axios.get('/chat/room/' + this.roomId).then(response => {
                this.room = response.data;
            });
        },
        sendMessage: function () {
            ws.send("/pub/chat/message", {}, JSON.stringify({
                type: 'TALK',
                roomId: this.roomId,
                writer: this.writer,
                message: this.message
            }));
            this.message = '';
        },
        receiveMessage: function (receive) {
            this.messages.unshift({
                "type": receive.type,
                "writer": receive.type === 'ENTER' ? 'system' : receive.writer,
                "message": receive.message
            })
        }
    }
});

// pub/sub event
ws.connect({}, function (frame) {
    ws.subscribe("/sub/chat/room/" + vm.$data.roomId, function (message) {
        var receive = JSON.parse(message.body);
        vm.receiveMessage(receive);
    });
    ws.send("/pub/chat/message", {}, JSON.stringify({
        type: 'ENTER',
        roomId: vm.$data.roomId,
        writer: vm.$data.writer
    }));
}, function (error) {
    alert("error " + error);
});
const amqp = require("amqplib/callback_api");

// create connection
amqp.connect("amqp://localhost", (err0, connection) => {
  if (err0) {
    throw err0;
  }

  // create channel
  connection.createChannel((err1, channel) => {
    if (err1) {
      throw err1;
    }

    // declare exhange
    const exhange = "topic_logs";
    const args = process.argv.slice(2);
    const key = args.length > 0 ? args[0] : "anonymous.info";
    const msg = args.slice(1).join(" ") || "Hello World";

    // assert exchange of type topic
    channel.assertExchange(exhange, "topic", {
      durable: false,
    });

    // publish the msg on particular routing key
    channel.publish(exhange, key, Buffer.from(msg));

    console.log(`[-->] Send ${key}: ${msg}`);
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
});

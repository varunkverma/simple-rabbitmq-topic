const amqp = require("amqplib/callback_api");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: receive_logs_topic.js <facility>.<severity>");
}

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

    // assert exchange of type topic
    channel.assertExchange(exhange, "topic", {
      durable: false,
    });

    // assert queue
    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      (err2, q) => {
        if (err2) {
          throw err2;
        }

        console.log(`[*] Waiting for logs. To exit press CTRL+C.`);

        // binding exchange to queue
        args.forEach((key) => {
          channel.bindQueue(q.queue, exhange, key);
        });

        // consume messages from queue
        channel.consume(
          q.queue,
          (msg) => {
            console.log(
              `[<--] ${msg.fields.routingKey}: ${msg.content.toString()}`
            );
          },
          {
            noAck: true,
          }
        );
      }
    );
  });
});

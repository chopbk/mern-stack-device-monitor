package com.viettel.transport.mqtt;

import com.viettel.kafka.TransportKafkaProducer;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.mqtt.*;
import io.netty.util.concurrent.Future;
import io.netty.util.concurrent.GenericFutureListener;

import java.nio.charset.Charset;

import static com.viettel.transport.mqtt.MqttTransportServer.producer;
import static io.netty.handler.codec.mqtt.MqttConnectReturnCode.CONNECTION_ACCEPTED;
import static io.netty.handler.codec.mqtt.MqttMessageType.CONNACK;
import static io.netty.handler.codec.mqtt.MqttMessageType.PUBACK;
import static io.netty.handler.codec.mqtt.MqttQoS.AT_LEAST_ONCE;
import static io.netty.handler.codec.mqtt.MqttQoS.AT_MOST_ONCE;

public class MqttTransportServerHandler extends ChannelInboundHandlerAdapter implements GenericFutureListener<Future<? super Void>> {

    @Override
    public void operationComplete(Future<? super Void> future) throws Exception {

    }

    @Override
    public void channelRead(ChannelHandlerContext context, Object msg) {
        if (msg instanceof MqttMessage) {
            MqttMessage message = (MqttMessage) msg;
            if (message.fixedHeader() != null) {
                processMqttMsg(context, message);
            } else {
                context.close();
            }

        } else {
            context.close();
        }

    }

    private void processMqttMsg(ChannelHandlerContext context, MqttMessage msg) {
        System.out.println(msg);
        switch (msg.fixedHeader().messageType()) {
            case CONNECT:
                processConnectMsg(context, (MqttConnectMessage)msg);
                break;
            case PUBLISH:
                processPublicMsg(context, (MqttPublishMessage)msg);
                break;
            default:
                break;
        }
    }

    private void processConnectMsg (ChannelHandlerContext context, MqttConnectMessage msg) {
        context.writeAndFlush(createMqttConnAckMsg(CONNECTION_ACCEPTED));
    }

    private void processPublicMsg (ChannelHandlerContext context, MqttPublishMessage msg) {
        int length = msg.content().capacity();
        String data = msg.payload().readCharSequence(length, Charset.forName("utf-8")).toString();
        String topic = msg.variableHeader().topicName();
        //Send ack
        int msgId = msg.variableHeader().packetId();
        if (msgId > 0) {
            context.writeAndFlush(createMqttPubAckMsg(msgId));
        }

        System.out.println("topic = " + topic);
        System.out.println("data = " + data);
        System.out.println("Sending to Kafka:");
        sendToTransportKafka(context, topic, data);
    }

    private void sendToTransportKafka(ChannelHandlerContext context, String topic, String data) {
//        String kafkaServer = "10.55.123.60:9092";   //Kafka of Hungdv39
//        String kafkaServer = "127.0.0.1:9092";
        try {
//            TransportKafkaProducer producer = new TransportKafkaProducer(kafkaServer);
            producer.put(topic, data);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private MqttConnAckMessage createMqttConnAckMsg(MqttConnectReturnCode returnCode) {
        MqttFixedHeader mqttFixedHeader =
                new MqttFixedHeader(CONNACK, false, AT_MOST_ONCE, false, 0);
        MqttConnAckVariableHeader mqttConnAckVariableHeader =
                new MqttConnAckVariableHeader(returnCode, true);
        return new MqttConnAckMessage(mqttFixedHeader, mqttConnAckVariableHeader);
    }

    public static MqttPubAckMessage createMqttPubAckMsg(int requestId) {
        MqttFixedHeader mqttFixedHeader =
                new MqttFixedHeader(PUBACK, false, AT_LEAST_ONCE, false, 0);
        MqttMessageIdVariableHeader mqttMsgIdVariableHeader =
                MqttMessageIdVariableHeader.from(requestId);
        return new MqttPubAckMessage(mqttFixedHeader, mqttMsgIdVariableHeader);
    }
}

package com.viettel.transport.mqtt;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.mqtt.MqttDecoder;
import io.netty.handler.codec.mqtt.MqttEncoder;

public class MqttTransportServerInitializer extends ChannelInitializer<SocketChannel> {
    public MqttTransportServerInitializer() {

    }

    @Override
    public void initChannel(SocketChannel ch) {
        ChannelPipeline pipeline = ch.pipeline();

        pipeline.addLast("decoder", new MqttDecoder());
        pipeline.addLast("encoder", MqttEncoder.INSTANCE);

        MqttTransportServerHandler handler = new MqttTransportServerHandler();
        pipeline.addLast(handler);

        ch.closeFuture().addListener(handler);
    }
}

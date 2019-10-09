package com.viettel.transport.mqtt;

import com.viettel.kafka.TransportKafkaProducer;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;


public class MqttTransportServer {
    private String host = "127.0.0.1";
    private Integer port = 1883;

    private Integer bossGroupThreadCount = 1;
    private Integer workerGroupThreadCount = 12;

//    private  MqttTransportContext context;

    private EventLoopGroup bossGroup;
    private EventLoopGroup workerGroup;
//    private Channel serverChannel;
    private ChannelFuture serverChannel;

    public static TransportKafkaProducer producer;


    public static void main(String[] args) throws Exception {
        //Read config

        new MqttTransportServer().run();
    }

    public void run() throws Exception {

        String kafkaServer = "10.55.123.60:9092";
        producer = new TransportKafkaProducer(kafkaServer);

        bossGroup = new NioEventLoopGroup(bossGroupThreadCount);
        workerGroup = new NioEventLoopGroup(workerGroupThreadCount);

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new MqttTransportServerInitializer());

//            serverBootstrap.group(bossGroup, workerGroup)
//                    .channel(NioServerSocketChannel.class) // (3)
//                    .childHandler(new ChannelInitializer<SocketChannel>() { // (4)
//                        @Override
//                        public void initChannel(SocketChannel ch) throws Exception {
//                            ch.pipeline().addLast(new DiscardServerHandler());
//                        }
//                    });

//            serverChannel = serverBootstrap.bind(host, port).sync().channel();
            serverChannel = serverBootstrap.bind(host, port).sync();

            serverChannel.channel().closeFuture().sync();
        } finally {
//            serverChannel1.close().sync();
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

}

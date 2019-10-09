package com.viettel.kafka;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;
import java.util.concurrent.ExecutionException;

public class TransportKafkaProducer {
    private final KafkaProducer<String, String> producer;

    public TransportKafkaProducer(String bootstrapServer) {
        Properties props = producerProps(bootstrapServer);
        producer = new KafkaProducer<>(props);
    }

    private Properties producerProps(String bootstrapServer) {
        String serializer = StringSerializer.class.getName();
        Properties props = new Properties();
        props.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServer);
        props.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, serializer);
        props.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, serializer);

        return props;
    }

    public void put(String topic, String msg) throws ExecutionException, InterruptedException {
        ProducerRecord<String, String> record = new ProducerRecord<>(topic, msg);
        producer.send(record, (metadata, e) -> {
            if (e != null) {
                return;
            }

        }).get();
    }
}

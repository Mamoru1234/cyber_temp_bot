package org.github.mamoru.cybertempbot.collector

data class MqttCollectorDataEvent(
        val mac: String,
        val token: String,
        val date: Number,
        val temperature: Number,
        val humidity: Number
)

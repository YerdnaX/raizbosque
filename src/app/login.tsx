import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";

export function Login() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    return (
        <View>
            <Text>Login</Text>
            <TextInput placeholder="Username" value={correo} onChangeText={setCorreo} />
            <TextInput placeholder="Password" secureTextEntry={true} value={contrasena} onChangeText={setContrasena} />
            <Pressable onPress={() => {
                if (estanvacios(correo, contrasena)) {
                    alert("Por favor, complete todos los campos.");
                }
            }}>
                <Text>Login</Text>
            </Pressable>
            <Pressable onPress={() => {
            }}>
                <Text>Registrarse</Text>
            </Pressable>
        </View>
    )
}

function estanvacios(correo: string, contrasena: string) {
    if (correo === "" || contrasena === "") {
        return true;
    } else {        return false;
    }
}
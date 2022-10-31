#pragma once

#include <napi.h>

class RequestRouter : public Napi::ObjectWrap<RequestRouter>
{
public:
    RequestRouter(const Napi::CallbackInfo&);
    Napi::Value Greet(const Napi::CallbackInfo&);

    static Napi::Function GetClass(Napi::Env);

private:
    std::string _greeterName;
};

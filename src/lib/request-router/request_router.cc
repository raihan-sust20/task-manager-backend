#include "request_router.h"

#include <string>

RequestRouter::RequestRouter(const Napi::CallbackInfo& info)
    : ObjectWrap(info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return;
  }

  if (!info[0].IsString()) {
    Napi::TypeError::New(env, "You need to name yourself")
        .ThrowAsJavaScriptException();
    return;
  }

  this->_greeterName = info[0].As<Napi::String>().Utf8Value();
}

Napi::Value RequestRouter::Greet(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 0) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  return Napi::String::New(env,
                           std::string("Hello ").append(this->_greeterName));
}

Napi::Function RequestRouter::GetClass(Napi::Env env) {
  return DefineClass(
      env, "RequestRouter",
      {
          RequestRouter::InstanceMethod("greet", &RequestRouter::Greet),
      });
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  Napi::String name = Napi::String::New(env, "RequestRouter");
  exports.Set(name, RequestRouter::GetClass(env));
  return exports;
}

NODE_API_MODULE(addon, Init)

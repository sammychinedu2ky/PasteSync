var builder = DistributedApplication.CreateBuilder(args);
var cache = builder.AddRedis("cache").WithRedisInsight().WithAddCustomPage();
var backendApi = builder.AddProject<Projects.backend>("backend");
var frontend = builder.AddNpmApp("frontend", "../frontend", "dev");
backendApi.WithReference(cache)
.WithHttpEndpoint(name: "backend", port: 5000)
.WaitFor(cache);

frontend.WithReference(backendApi)
 .WithHttpEndpoint(env: "PORT", port: 3000)
.WaitFor(backendApi);
builder.Build().Run();

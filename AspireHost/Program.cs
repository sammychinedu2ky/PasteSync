var builder = DistributedApplication.CreateBuilder(args);
var cache = builder.AddRedis("cache").WithRedisInsight().WithAddCustomPage();

var backendApi = builder.AddProject<Projects.backend>("backend");
backendApi.WithReference(cache)
.WithHttpEndpoint(name: "backend", port: 5000)
.WaitFor(cache);

var frontend = builder.AddNpmApp("frontend", "../frontend", "dev");
frontend.WithReference(backendApi)
 .WithHttpEndpoint(env: "PORT", port: 3000)
 .WithExternalHttpEndpoints()
.WaitFor(backendApi);
builder.Build().Run();

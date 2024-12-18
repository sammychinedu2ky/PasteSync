using System;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace AppHost.Hosting;

public static class RedisResourceBuilderExtension
{
public static IResourceBuilder<RedisResource> WithAddCustomPage(this IResourceBuilder<RedisResource> builder){
    builder.WithCommand(
        name: "custom-page",
        displayName: "Custom Page",
        executeCommand: context => OnRunAddCustomPage(builder, context),
        updateState: OnUpdataResourceState,
        iconName: "AddSquare"
    );
    return builder;
}

    private static ResourceCommandState OnUpdataResourceState(UpdateCommandStateContext context)
    {
       if(context.ResourceSnapshot.HealthStatus == HealthStatus.Healthy){
        return ResourceCommandState.Enabled;
       }
       return ResourceCommandState.Disabled;
    }

    private static async Task<ExecuteCommandResult> OnRunAddCustomPage(IResourceBuilder<RedisResource> builder, ExecuteCommandContext context)
    {
        var connectionString = await builder.Resource.GetConnectionStringAsync() ??
        throw new InvalidOperationException("Connection string is not available");

        await using var connection = ConnectionMultiplexer.Connect(connectionString);
        var db = connection.GetDatabase();
        await db.HashSetAsync("custom-page", new[]
        {
            new HashEntry("data", "This is jsut a custom data. So lets check it out"),
        });
        return CommandResults.Success();
    }
}
